package com.hatchgrid.common.domain.vo.credential

import com.hatchgrid.common.domain.error.BusinessRuleValidationException

class CredentialException(
    override val message: String,
    override val cause: Throwable? = null
) : BusinessRuleValidationException(message, cause)
