package com.hatchgrid.thryve.form.domain.exception

import com.hatchgrid.common.domain.error.BusinessRuleValidationException
import com.hatchgrid.common.domain.error.EntityNotFoundException

/**
 * Represents a general exception related to forms in the Hatchgrid application.
 *
 * @property message The detailed error message describing the exception.
 * @property cause The underlying cause of the exception, if any.
 */
data class FormException(
    override val message: String, // Detailed error message
    override val cause: Throwable? = null // Optional cause of the exception
) : BusinessRuleValidationException(message, cause)

/**
 * Represents an exception that is thrown when a specific form is not found in the Hatchgrid application.
 *
 * @property message The detailed error message describing the exception.
 * @property cause The underlying cause of the exception, if any.
 */
data class FormNotFoundException(
    override val message: String, // Detailed error message
    override val cause: Throwable? = null // Optional cause of the exception
) : EntityNotFoundException(message, cause)
