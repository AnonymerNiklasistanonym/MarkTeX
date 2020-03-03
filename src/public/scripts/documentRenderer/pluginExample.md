Instructions on how to create a plugin for `markdown-it`.

[(Based on the official documentation)](https://markdown-it.github.io/markdown-it/#Ruler)

## Renderer

- Generates HTML from parsed token stream
- Each instance has independent copy of rules
- You can add new rules if you create plugin and add new token types

### `Renderer.render`/`Renderer.renderInline`

Takes token stream and generates HTML (when inline only for single token of inline type)

```ts
Renderer.render(
    tokens: [],   // list on block tokens to render ???
    options: {},  // params of parser instance
    env: {}       // additional data from parsed input (references, for example)
): string         // HTML string
```

### `Renderer.renderAttrs`

Render token attributes to string

```ts
Renderer.renderAttrs(
    token  // ???
): string  // ???
```

#### `Renderer.renderToken`

Default token renderer

```ts
Renderer.renderToken(
    tokens,  // list of tokens ???
    idx,     // token index to render
    options  // params of parser instance
): string  // ???
```

### Rules

They contain render rules for tokens.
Custom rules can be added to the renderer or overwrite existing ones:

```ts
import MarkdownIt from "markdown-it";

const md = new MarkdownIt();
md.renderer.rules.strong_open  = () => "<b>";
md.renderer.rules.strong_close = () => "</b>";

const renderResult = md.renderInline(mdString);
```

Each rule is called as independent static function with fixed signature:

```ts
const my_token_render = (
    tokens,  // list on block tokens to render ???
    idx,     // token index to render
    options, // params of parser instance
    env,
    renderer
): string => "renderedHTMLString"
}
```

#### Examples/Default rules

```js
default_rules.html_block = (tokens, idx) => tokens[idx].content;

default_rules.text = (tokens, idx) => escapeHtml(tokens[idx].content);

default_rules.image = (tokens, idx, options, env, renderer) => {
    const token = tokens[idx];
    // "alt" attr MUST be set, even if empty
    // `renderInlineAsText` is internal special method for images -> Don't use it!
    token.attrs[token.attrIndex('alt')][1] = renderer.renderInlineAsText(token.children, options, env);
    return renderer.renderToken(tokens, idx, options);
};

default_rules.code_inline = (tokens, idx, options, env, renderer) => {
    const token = tokens[idx];
    return `<code${renderer.renderAttrs(token)}>${escapeHtml(token.content)}</code>`;
};

default_rules.code_block = (tokens, idx, options, env, renderer) => {
    const token = tokens[idx];
    return `<pre${renderer.renderAttrs(token)}><code>${escapeHtml(token.content)}</code></pre>\n`;
};

default_rules.fence = (tokens, idx, options, env, renderer) => {
    const token = tokens[idx];
    const info = token.info ? unescapeAll(token.info).trim() : "";
    const langName = info ? info.split(/\s+/g)[0] : "";
    const highlighted = options.highlight
        ? options.highlight(token.content, langName) || escapeHtml(token.content)
        : highlighted = escapeHtml(token.content);

    if (highlighted.indexOf('<pre') === 0) {
        return highlighted + '\n';
    }

    // If language exists, inject class gently, without modifying original token
    if (info) {
        let i = token.attrIndex('class');
        const tmpAttrs = token.attrs ? token.attrs.slice() : [];

        if (i < 0) {
            tmpAttrs.push([ 'class', options.langPrefix + langName ]);
        } else {
            tmpAttrs[i][1] += ' ' + options.langPrefix + langName;
        }

        // Fake token just to render attributes
        const tempToken = { attrs: tmpAttrs };
        return `<pre><code${renderer.renderAttrs(tempToken)}><code>${highlighted}</code></pre>\n`;
    }

    return `<pre><code${renderer.renderAttrs(token)}><code>${highlighted}</code></pre>\n`;
};
```

#### Token

```ts
interface Token {
    content: string
    type: "inline" | "text" | "image" | "undefined"
    children: Token[]
    nesting: number
    hidden: boolean
    tag: string // HTML tag
    block: boolean
    attrs: Attr[]
}
```

### Ruler

Helper class to manage sequences of functions (rules):

- keep rules in defined order
- assign the name to each rule
- enable/disable rules
- add/replace rules
- allow assign rules to additional named chains (in the same)
- caching lists of active rules

You will not need use this class directly until write plugins.

#### `Ruler.after`/`Ruler.before`

Add new rule to chain after/before one with given name

```ts
Ruler.after = (
    afterName: string,            // new rule will be added after this one
    ruleName: string,             // name of added rule
    ruleFn: (state): ???,         // rule function
    options?: { alt: string[] }   // optional rule options (alt = list of "alternate" chains)
): void => {};
```

```ts
md.inline.ruler.after('text', 'ruleName', replace(state): ??? => {
    // ???
});
md.block.ruler.before('paragraph', 'my_rule', replace(state): ??? => {
    // ???
});
```

#### `Ruler.push`

Push new rule to the end of chain

```ts
Ruler.push = (
    afterName: string,            // new rule will be added after this one
    ruleName: string,             // name of added rule
    ruleFn: (state): ???,         // rule function
    options?: { alt: string[] }   // optional rule options (alt = list of "alternate" chains)
): void => {};
```

```ts
md.core.ruler.push('my_rule', replace(state): ??? => {
  //...
});
```

#### Example/Default rulers

```ts
const inlineText = (state, silent?: boolean): boolean => {
    const pos = state.pos;
    while (pos < state.posMax && !isTerminatorChar(state.src.charCodeAt(pos))) {
        pos++;
    }
    if (pos === state.pos) {
        return false;
    }
    if (!silent) {
        state.pending += state.src.slice(state.pos, pos);
    }
    state.pos = pos;
    return true;
};
```
