package com.hatchgrid.thryve

import com.hatchgrid.common.domain.vo.credential.Credential
import com.hatchgrid.common.domain.vo.credential.CredentialId
import java.util.*
import net.datafaker.Faker

/**
 * CredentialGenerator is a utility class for generating credentials.
 * @created 2/8/23
 */
object CredentialGenerator {
    private val faker = Faker()
    fun generate(password: String = generateValidPassword()): Credential =
        Credential(CredentialId(UUID.randomUUID()), password)

    fun generateValidPassword(): String {
        var password: String
        do {
            password = faker.internet().password(8, 80, true, true, true)
        } while (!isPasswordValid(password))
        return password
    }
    private fun isPasswordValid(password: String): Boolean {
        val hasLowercase = password.any { it.isLowerCase() }
        val hasUppercase = password.any { it.isUpperCase() }
        val hasDigit = password.any { it.isDigit() }
        val hasSpecial = password.any { !it.isLetterOrDigit() }
        return hasLowercase && hasUppercase && hasDigit && hasSpecial
    }
}
