package com.hatchgrid.thryve

import com.hatchgrid.common.domain.vo.credential.Credential
import com.hatchgrid.common.domain.vo.credential.CredentialId
import java.util.*

/**
 * CredentialGenerator is a utility class for generating credentials.
 * @created 2/8/23
 */
object CredentialGenerator {
    fun generate(password: String = Credential.generateRandomCredentialPassword()): Credential =
        Credential(CredentialId(UUID.randomUUID()), password)
}
