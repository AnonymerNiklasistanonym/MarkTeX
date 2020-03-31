
export interface HbsHeaderNavigationBarLink {
    alignRight?: boolean
    id?: string
    url: string
    title: string
}

export interface NavigationBar {
    links: HbsHeaderNavigationBarLink[]
}

export interface NavigationBarOptions {
    loggedIn?: boolean
}
