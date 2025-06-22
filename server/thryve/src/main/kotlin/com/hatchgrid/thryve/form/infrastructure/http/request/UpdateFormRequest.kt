package com.hatchgrid.thryve.form.infrastructure.http.request

import com.hatchgrid.thryve.AppConstants.HEXADECIMAL_COLOR_PATTERN
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Pattern
import jakarta.validation.constraints.Size

data class UpdateFormRequest(
    @field:NotBlank(message = "Name is required")
    @field:Size(max = 255, message = "Name cannot be longer than 255 characters")
    val name: String,
    @field:NotBlank(message = "Header is required")
    @field:Size(max = 255, message = "Header cannot be longer than 255 characters")
    val header: String,
    @field:NotBlank(message = "Description is required")
    @field:Size(max = 1000, message = "Description cannot be longer than 1000 characters")
    val description: String,
    @field:NotBlank(message = "Input placeholder is required")
    @field:Size(max = 255, message = "Input placeholder cannot be longer than 255 characters")
    val inputPlaceholder: String,
    @field:NotBlank(message = "Button text is required")
    @field:Size(max = 255, message = "Button text cannot be longer than 255 characters")
    val buttonText: String,
    @field:NotBlank(message = "Button color is required")
    @field:Size(max = 7, message = "Button color must be a valid hex code")
    @field:Pattern(
        regexp = HEXADECIMAL_COLOR_PATTERN,
        message = "Button color must be a valid hex code",
    )
    val buttonColor: String,
    @field:NotBlank(message = "Background color is required")
    @field:Size(max = 7, message = "Background color must be a valid hex code")
    @field:Pattern(
        regexp = HEXADECIMAL_COLOR_PATTERN,
        message = "Background color must be a valid hex code",
    )
    val backgroundColor: String,
    @field:NotBlank(message = "Text color is required")
    @field:Size(max = 7, message = "Text color must be a valid hex code")
    @field:Pattern(
        regexp = HEXADECIMAL_COLOR_PATTERN,
        message = "Text color must be a valid hex code",
    )
    val textColor: String,
    @field:NotBlank(message = "Button text color is required")
    @field:Size(max = 7, message = "Button text color must be a valid hex code")
    @field:Pattern(
        regexp = HEXADECIMAL_COLOR_PATTERN,
        message = "Button text color must be a valid hex code",
    )
    val buttonTextColor: String
)
