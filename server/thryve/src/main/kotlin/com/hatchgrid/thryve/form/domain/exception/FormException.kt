package com.hatchgrid.thryve.form.domain.exception

import com.hatchgrid.common.domain.error.BusinessRuleValidationException
import com.hatchgrid.common.domain.error.EntityNotFoundException

/**
 * Represents a general exception related to forms in the Hatchgrid application.
 *
 * @param message the detailed error message describing the exception.
 * @param cause optional underlying cause of the exception.
 */
class FormException(
    override val message: String,
    override val cause: Throwable? = null
) : BusinessRuleValidationException(message, cause)

/**
 * Represents an exception thrown when a specific form cannot be located.
 *
 * @param message detailed error message describing the exception.
 * @param cause optional underlying cause of the exception.
 */
class FormNotFoundException(
    override val message: String,
    override val cause: Throwable? = null
) : EntityNotFoundException(message, cause)
