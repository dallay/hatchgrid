package com.hatchgrid.common.domain.bus.notification
/**
 * Interface to be implemented for a non-blocking notification handler
 *
 * @since 1.0.9
 * @param T any [Notification] subclass to handle
 * @see Notification
 */
interface NotificationHandler<in T> where T : Notification {

    /**
     * Handles a notification
     *
     * @param notification the notification to handle
     */
    suspend fun handle(notification: T)
}
