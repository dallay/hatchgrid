package com.hatchgrid.thryve.newsletter.subscriber.infrastructure.http

import com.hatchgrid.thryve.AppConstants.Paths.API
import com.hatchgrid.thryve.AppConstants.Paths.SUBSCRIBER
import com.hatchgrid.thryve.newsletter.subscriber.application.count.bystatus.CountByStatusQuery
import com.hatchgrid.thryve.newsletter.subscriber.application.count.bystatus.SubscriberCountByStatusResponse
import com.hatchgrid.common.domain.bus.Mediator
import com.hatchgrid.spring.boot.ApiController
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import org.slf4j.LoggerFactory
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.ResponseBody
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping(value = [API], produces = ["application/vnd.api.v1+json"])
class SubscriberCountByStatusController(
    mediator: Mediator
) : ApiController(mediator) {

    @Operation(summary = "Count subscribers by status")
    @ApiResponses(
        ApiResponse(responseCode = "200", description = "Success"),
        ApiResponse(responseCode = "500", description = "Internal server error"),
    )
    @GetMapping("$SUBSCRIBER/count-by-status")
    @ResponseBody
    suspend fun countByStatus(
        @PathVariable workspaceId: String
    ): ResponseEntity<SubscriberCountByStatusResponse> {
        log.debug("Counting subscribers by status: {}", sanitizeAndJoinPathVariables(workspaceId))
        val response = ask(
            CountByStatusQuery(workspaceId),
        )
        return ResponseEntity.ok(response)
    }

    companion object {
        private val log = LoggerFactory.getLogger(SubscriberCountByStatusController::class.java)
    }
}
