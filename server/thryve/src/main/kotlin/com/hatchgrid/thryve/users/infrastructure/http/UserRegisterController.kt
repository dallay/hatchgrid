package com.hatchgrid.thryve.users.infrastructure.http

import com.hatchgrid.thryve.users.application.UserRegistrator
import com.hatchgrid.thryve.users.application.response.UserResponse
import com.hatchgrid.thryve.users.domain.ApiDataResponse
import com.hatchgrid.thryve.users.domain.ApiResponseStatus
import com.hatchgrid.thryve.users.infrastructure.http.request.RegisterUserRequest
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import org.apache.commons.text.StringEscapeUtils
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.validation.annotation.Validated
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api", produces = ["application/vnd.api.v1+json"])
class UserRegisterController(private val userRegistrator: UserRegistrator) {

    @Operation(summary = "Register endpoint")
    @ApiResponses(
        ApiResponse(responseCode = "201", description = "Created"),
        ApiResponse(responseCode = "400", description = "Bad request"),
        ApiResponse(responseCode = "500", description = "Internal server error"),
    )
    @PostMapping("/register")
    suspend fun registerUser(@Validated @RequestBody registerUserRequest: RegisterUserRequest):
        ResponseEntity<ApiDataResponse<UserResponse>> {
        log.info("Registering new user with email: {}", StringEscapeUtils.escapeJava(registerUserRequest.email))
        return try {
            val response = userRegistrator.registerNewUser(registerUserRequest.toRegisterUserCommand())
            mapRegistrationResult(response)
        } catch (@Suppress("TooGenericExceptionCaught") error: Throwable) {
            handleRegistrationError(error)
        }
    }

    private fun mapRegistrationResult(apiDataResponse: ApiDataResponse<UserResponse>):
        ResponseEntity<ApiDataResponse<UserResponse>> {
        return when (apiDataResponse.status) {
            ApiResponseStatus.SUCCESS -> ResponseEntity.status(HttpStatus.CREATED).body(apiDataResponse)
            ApiResponseStatus.FAILURE -> ResponseEntity.status(HttpStatus.BAD_REQUEST).body(apiDataResponse)
        }
    }

    private fun handleRegistrationError(error: Throwable): ResponseEntity<ApiDataResponse<UserResponse>> {
        log.error("Error during user registration: {}", error.message)
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build()
    }

    companion object {
        private val log = LoggerFactory.getLogger(UserRegisterController::class.java)
    }
}
