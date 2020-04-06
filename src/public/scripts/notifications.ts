export interface NotificationMessage {
    /** Notification title */
    title: string
    /** Notification text body */
    body?: string
    /**
     * Notification image.
     *
     * Web URL or base64 works both.
     **/
    image?: string
    /** Notification icon */
    icon?: string
    /** Listener if the notification was clicked */
    onClick?: () => void
    /** Open this url when the notification was clicked */
    onClickUrl?: string
}

export const show = async (input: NotificationMessage): Promise<void> => {
    // Check if API is supported or not
    if (Notification.permission === "denied") {
        // eslint-disable-next-line no-console
        console.debug("Notifications are denied");
        return;
    }
    if (Notification.permission === "default") {
        // Ask for permission to show notifications
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
            // eslint-disable-next-line no-console
            console.debug(`Notification request was not granted "${permission}"`);
            return;
        }
    }
    // Add the text to the notification
    const notificationOptions: NotificationOptions = {
        body: input.body,
        icon: input.icon ? input.icon : "/favicon/favicon_512.png",
        image: input.image
    };
    // Create notification
    const notification = new Notification(input.title, notificationOptions);
    // Add onclick actions
    if (input.onClick) { notification.addEventListener("click", input.onClick); }
    if (input.onClickUrl) {
        notification.addEventListener("click", () => {
            const documentWindow = window.open(input.onClickUrl);
            if (documentWindow) { documentWindow.focus(); }
        });
    }
};

export const showError = async (actionThatFailed: string, error: Error): Promise<void> => {
    if (DEBUG_APP) { console.error(error); }
    await show({
        body: error.message,
        title: `Error: ${actionThatFailed}`
    });
};
