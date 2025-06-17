package com.hatchgrid.thryve.newsletter.subscriber.domain

import com.hatchgrid.common.domain.BaseValidateValueObject
import com.hatchgrid.thryve.newsletter.subscriber.domain.exceptions.FirstNameNotValidException

private const val NAME_LEN = 150

/**
 * Email value object
 * @param firstname first name value
 * @throws FirstNameNotValidException if first name is not valid
 * @see BaseValidateValueObject
 * @see BaseValueObject
 * @see FirstNameNotValidException
 */
data class FirstName(val firstname: String) : BaseValidateValueObject<String>(firstname) {
    /**
     * Validate first name value object with regex
     * @param value first name value
     * @throws FirstNameNotValidException if first name is not valid
     */
    override fun validate(value: String) {
        val firstname = value.trim()
        if (firstname.isEmpty() || firstname.length > NAME_LEN) {
            throw FirstNameNotValidException(value)
        }
    }

    override fun toString(): String = firstname
}
