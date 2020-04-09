
/**
 * Create `DELETE` query
 * ```sql
 * DELETE FROM tableName: string WHERE whereColumn=?;
 * ```
 *
 * @param tableName Sanitized table name
 * @param whereColumnName Sanitized column on which value a row should be removed
 * @returns Query
 */
export const remove = (tableName: string, whereColumnName = "id"): string => {
    return `DELETE FROM ${tableName} WHERE ${whereColumnName}=?;`;
};

/**
 * Create `INSERT INTO` query
 * ```sql
 * INSERT INTO tableName: string(column_0, column_i, column_n) VALUES(?, ?, ?);
 * ```
 *
 * @param tableName Sanitized table name
 * @param columnNames Sanitized column names that should be overwritten with new values
 * @returns Query
 */
export const insert = (tableName: string, columnNames: string[]): string => {
    return `INSERT INTO ${tableName}(${columnNames.join(",")}) ` +
        `VALUES(${columnNames.map(() => "?").join(",")});`;
};

export interface ExistsDbOut {
    // eslint-disable-next-line camelcase
    exists_value: number
}

/**
 * Create `EXISTS` query
 * ```sql
 * SELECT EXISTS(SELECT 1 FROM tableName: string WHERE column=? AS exists_value;
 * ```
 *
 * @param tableName Sanitized table name
 * @param whereColumnName Sanitized column name which is checked for existing with query value
 * @returns Query
 */
export const exists = (tableName: string, whereColumnName = "id"): string => {
    return `SELECT EXISTS(SELECT 1 FROM ${tableName} WHERE ${whereColumnName}=?) AS exists_value;`;
};

export interface SelectQueryInnerJoin {
    /**
     * Name of linked table
     */
    otherTableName: string
    /**
     * Name of linked column of linked table
     */
    otherColumn: string
    /**
     * Name of column that it should be linked to
     */
    thisColumn: string
}

/**
 * ```sql
 * ORDER BY
 * column_1 ASC,
 * column_2 DESC;
 * ```
 */
export interface SelectQueryOrderBy {
    /**
     * Name of the column that should be sorted
     */
    column: string
    /**
     * True if ascending sort, false if descending
     */
    ascending: boolean
}

export interface SelectWhereColumn {
    columnName: string
    tableName?: string
}

export interface SelectQueryOptions {
    /**
     * Inner join descriptions
     */
    innerJoins?: SelectQueryInnerJoin[]
    /**
     * Describe a specification of which value a row needs to have to be included
     * `WHERE column = ?`
     */
    whereColumn?: (string|SelectWhereColumn)
    /**
     * Describe a complicated where information: overwrites whereColumn if defined
     */
    whereCustom?: string
    /**
     * Only get back unique results
     */
    unique?: boolean
    /**
     * Additionally order the results by some columns
     */
    orderBy?: SelectQueryOrderBy[]
}

export interface SelectColumn {
    alias?: string
    columnName: string
    tableName?: string
}

/**
 * Create `SELECT` query
 * ```sql
 * SELECT column_0, column_i, column_n FROM tableName: string;
 * SELECT column_i FROM tableName: string WHERE whereColumn=?;
 * SELECT column FROM table INNER JOIN otherTable_i ON otherCol_i=thisCol_i;
 * SELECT DISTINCT column_0 FROM tableName: string;
 * SELECT column_0 FROM tableName: string ORDER BY column_0 ASC;
 * ```
 *
 * @param tableName
 * @param columns
 * @param options
 * @returns Query
 */
// eslint-disable-next-line complexity
export const select = (tableName: string, columns: (string|SelectColumn)[], options?: SelectQueryOptions): string => {
    let innerJoinsStr = "";
    let whereStr = "";
    let orderStr = "";
    let uniqueStr = "";
    if (options) {
        if (options.unique) {
            uniqueStr = "DISTINCT ";
        }
        if (options.innerJoins) {
            innerJoinsStr = options.innerJoins
                .map(a => `INNER JOIN ${a.otherTableName} ON ${a.otherTableName}.${a.otherColumn}=${a.thisColumn}`)
                .join(" ");
            if (innerJoinsStr.length > 0) {
                innerJoinsStr = ` ${innerJoinsStr}`;
            }
        }
        if (options.whereColumn) {
            if (typeof options.whereColumn === "string") {
                whereStr = ` WHERE ${options.whereColumn}=?`;
            } else {
                whereStr = ` WHERE ${options.whereColumn.tableName}.${options.whereColumn.columnName}=?`;
            }
        }
        if (options.orderBy) {
            orderStr = " ORDER BY " +
                options.orderBy.map(order => order.column + " " +
                    (order.ascending ? "ASC" : "DESC")).join(",");
        }
    }
    const columnStrings = columns.reduce((previousVal: string[], currentValue) => {
        if (typeof currentValue === "string") {
            return previousVal.concat(currentValue);
        }
        let columnEntry = "";
        if (currentValue.tableName) {
            columnEntry += `${currentValue.tableName}.`;
        }
        columnEntry += currentValue.columnName;
        if (currentValue.alias) {
            columnEntry += ` AS ${currentValue.alias}`;
        }
        return previousVal.concat(columnEntry);
    }, []);
    return `SELECT ${uniqueStr}${columnStrings.join(",")} ` +
        `FROM ${tableName}${innerJoinsStr}${whereStr}${orderStr};`;
};

/**
 * <table><tr><th>Expression Affinity</th><th>Column Declared Type</th>
 * </tr><tr><td>TEXT                       </td><td>"TEXT"
 * </td></tr><tr><td>NUMERIC               </td><td>"NUM"
 * </td></tr><tr><td>INTEGER               </td><td>"INT"
 * </td></tr><tr><td>REAL                  </td><td>"REAL"
 * </td></tr><tr><td>BLOB (a.k.a "NONE")   </td><td>"" (empty string)
 * </td></tr></table>
 * Source: {@link https://www.sqlite.org/lang_createtable.html}
 */
export enum CreateTableColumnType {
    TEXT = "TEXT",
    NUMERIC = "NUMERIC",
    INTEGER = "INTEGER",
    REAL = "REAL",
    BLOB = "BLOB"
};

export interface CreateTableColumnOptions {
    notNull?: boolean
    primaryKey?: boolean
    unique?: boolean
}

export interface CreateTableColumn {
    /**
     * Column name
     */
    name: string
    /**
     * Column type (`INTEGER`, `TEXT`)
     */
    type: CreateTableColumnType
    /**
     * Column options (`NOT NULL`, `UNIQUE`, `PRIMARY KEY`)
     */
    options?: CreateTableColumnOptions
    /**
     * Foreign key options
     */
    foreign?: CreateTableColumnForeign
}

export interface CreateTableColumnForeign {
    /**
     * Foreign key table name
     */
    tableName: string
    /**
     * Foreign key table column name
     */
    column: string
    /**
     * Options for foreign key (`ON DELETE CASCADE ON UPDATE NO ACTION`)
     */
    options?: string[]
}

/**
 * Create database table
 * ```sql
 * CREATE TABLE IF NOT EXISTS contacts (
 * contact_id INTEGER PRIMARY KEY,
 * first_name TEXT NOT NULL,
 * last_name TEXT NOT NULL,
 * email text NOT NULL UNIQUE,
 * phone text NOT NULL UNIQUE
 * );
 * ```
 *
 * @returns Query
 * @param tableName
 * @param columns
 * @param ifNotExists
 */
export const createTable = (tableName: string, columns: CreateTableColumn[], ifNotExists = false): string => {
    // eslint-disable-next-line complexity
    const columnOptionsToString = (columnOptions?: CreateTableColumnOptions): string => {
        const columnOptionsArray = [];
        if (columnOptions) {
            if (columnOptions.primaryKey) {
                columnOptionsArray.push("PRIMARY KEY");
            }
            if (columnOptions.unique) {
                columnOptionsArray.push("UNIQUE");
            }
            if (columnOptions.notNull) {
                columnOptionsArray.push("NOT NULL");
            }
        }
        if (columnOptionsArray.length === 0) {
            return "";
        } else {
            return " " + columnOptionsArray.join(" ");
        }
    };
    const columnsString = columns.map(column => {
        return `${column.name} ${column.type}` +
            `${columnOptionsToString(column.options)}`;
    }).join(",");
    const foreignKeysString = columns
        .filter(column => column.foreign !== undefined)
        .map(column => {
            const foreign = column.foreign as CreateTableColumnForeign;
            return `FOREIGN KEY (${column.name}) REFERENCES ${foreign.tableName} (${foreign.column})` +
            (foreign.options !== undefined ? " " + foreign.options.join(" ") : "");
        });
    const foreignKeysStringFinal = foreignKeysString.length > 0
        ? "," + foreignKeysString.join(",") : "";
    return `CREATE TABLE ${ifNotExists ? "IF NOT EXISTS " : ""}${tableName} (` +
        `${columnsString}${foreignKeysStringFinal});`;
};

/**
 * Delete a database table
 * ```sql
 * DROP TABLE contacts;
 * DROP TABLE IF EXISTS contacts;
 * ```
 *
 * @param tableName
 * @param ifExists Only remove table if it exists
 * @returns Query
 */
export const dropTable = (tableName: string, ifExists = false): string => {
    return `DROP TABLE ${ifExists ? "IF EXISTS " : ""}${tableName};`;
};

/**
 * Update database table row values
 * ```sql
 * UPDATE employees
 * SET lastname = 'Smith', firstname = 'Jo'
 * WHERE
 * employeeid = 3
 * ```
 *
 * @param values Values that should be updated
 * @param tableName
 * @param whereColumn Column where the row changes should be made
 * @returns Query
 */
export const update = (tableName: string, values: string[], whereColumn = "id"): string => {
    const setString = values.map(value => `${value}=?`).join(",");
    return `UPDATE ${tableName} SET ${setString} WHERE ${whereColumn}=?;`;
};
