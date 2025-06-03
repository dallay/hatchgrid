package com.hatchgrid.thryve.workspace.infrastructure.http

import com.hatchgrid.thryve.workspace.application.create.CreateWorkspaceCommand
import com.hatchgrid.thryve.workspace.infrastructure.http.request.CreateWorkspaceRequest
import com.hatchgrid.common.domain.bus.Mediator
import com.hatchgrid.spring.boot.ApiController
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import java.net.URI
import org.slf4j.LoggerFactory
import org.springframework.http.ResponseEntity
import org.springframework.validation.annotation.Validated
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

/**
 * This controller handles the creation of a workspace.
 *
 * @property mediator The [Mediator] used to dispatch commands.
 */
@RestController
@RequestMapping(value = ["/api"], produces = ["application/vnd.api.v1+json"])
class CreateWorkspaceController(
    private val mediator: Mediator,
) : ApiController(mediator) {

    /**
     * This method handles the PUT request to create a workspace.
     *
     * @param id The ID of the workspace.
     * @param request The request body containing the details of the workspace to be created.
     * @return A ResponseEntity indicating the result of the operation.
     */
    @Operation(summary = "Create a workspace with the given data")
    @ApiResponses(
        ApiResponse(responseCode = "201", description = "Created"),
        ApiResponse(responseCode = "500", description = "Internal server error"),
    )
    @PutMapping("/workspace/{id}")
    suspend fun create(
        @PathVariable id: String,
        @Validated @RequestBody request: CreateWorkspaceRequest
    ): ResponseEntity<String> {
        val safeId = sanitizePathVariable(id)
        log.debug("Creating Workspace with ID: {}", safeId)
        dispatch(
            CreateWorkspaceCommand(
                safeId,
                request.name,
                request.description,
                request.ownerId,
            ),
        )
        return ResponseEntity.created(URI.create("/api/workspace/$safeId")).build()
    }

    companion object {
        private val log = LoggerFactory.getLogger(CreateWorkspaceController::class.java)
    }
}
