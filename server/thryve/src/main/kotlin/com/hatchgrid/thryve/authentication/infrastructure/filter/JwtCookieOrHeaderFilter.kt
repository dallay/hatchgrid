package com.hatchgrid.thryve.authentication.infrastructure.filter

import com.hatchgrid.thryve.authentication.infrastructure.cookie.AuthCookieBuilder
import org.springframework.http.HttpHeaders
import org.springframework.stereotype.Component
import org.springframework.web.server.ServerWebExchange
import org.springframework.web.server.WebFilter
import org.springframework.web.server.WebFilterChain
import reactor.core.publisher.Mono

@Component
class JwtCookieOrHeaderFilter : WebFilter {
    override fun filter(exchange: ServerWebExchange, chain: WebFilterChain): Mono<Void> {
        val request = exchange.request

        val alreadyHasAuthHeader = request.headers[HttpHeaders.AUTHORIZATION]?.any { it.startsWith("Bearer ") } == true
        val accessToken = request.cookies[AuthCookieBuilder.ACCESS_TOKEN]?.firstOrNull()?.value

        return if (!alreadyHasAuthHeader && !accessToken.isNullOrBlank()) {
            val mutatedRequest = request.mutate()
                .header(HttpHeaders.AUTHORIZATION, "Bearer $accessToken")
                .build()

            chain.filter(exchange.mutate().request(mutatedRequest).build())
        } else {
            chain.filter(exchange)
        }
    }
}
