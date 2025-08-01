package com.hatchgrid.thryve.authentication.infrastructure.cookie

import com.hatchgrid.thryve.authentication.domain.AccessToken
import org.springframework.http.ResponseCookie
import org.springframework.http.server.reactive.ServerHttpResponse

/**
 * [AuthCookieBuilder] is a utility class that builds cookies for the authentication process.
 * It provides a method to build cookies for the access token.
 */
object AuthCookieBuilder {
    const val ACCESS_TOKEN = "ACCESS_TOKEN"
    const val REFRESH_TOKEN = "REFRESH_TOKEN"
    private const val SESSION = "SESSION"
    private const val SAME_SITE_LAX = "Lax"

    /**
     * Builds cookies for the access token.
     * Adds the access token, refresh token, and session state cookies to the response.
     * @param response The ServerHttpResponse to which the cookies are added.
     * @param accessToken The access token containing the token, refresh token, and session state.
     */
    fun buildCookies(
        response: ServerHttpResponse,
        accessToken: AccessToken
    ) {
        response.addCookie(
            ResponseCookie.from(ACCESS_TOKEN, accessToken.token)
                .path("/")
                .maxAge(accessToken.expiresIn)
                .httpOnly(true)
                .secure(true)
                .sameSite(SAME_SITE_LAX)
                .build(),
        )
        response.addCookie(
            ResponseCookie.from(REFRESH_TOKEN, accessToken.refreshToken)
                .path("/")
                .maxAge(accessToken.expiresIn)
                .httpOnly(true)
                .secure(true)
                .sameSite(SAME_SITE_LAX)
                .build(),
        )
        if (accessToken.sessionState != null) {
            response.addCookie(
                ResponseCookie.from(SESSION, accessToken.sessionState)
                    .path("/")
                    .maxAge(accessToken.expiresIn)
                    .httpOnly(true)
                    .secure(true)
                    .sameSite(SAME_SITE_LAX)
                    .build(),
            )
        }
    }

    fun clearCookies(response: ServerHttpResponse) {
        response.addCookie(
            ResponseCookie.from(ACCESS_TOKEN, "")
                .path("/")
                .maxAge(0)
                .httpOnly(true)
                .secure(true)
                .sameSite(SAME_SITE_LAX)
                .build(),
        )
        response.addCookie(
            ResponseCookie.from(REFRESH_TOKEN, "")
                .path("/")
                .maxAge(0)
                .httpOnly(true)
                .secure(true)
                .sameSite(SAME_SITE_LAX)
                .build(),
        )
        response.addCookie(
            ResponseCookie.from(SESSION, "")
                .path("/")
                .maxAge(0)
                .httpOnly(true)
                .secure(true)
                .sameSite(SAME_SITE_LAX)
                .build(),
        )
    }
}
