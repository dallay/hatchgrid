package com.hatchgrid.thryve

/**
 * This object contains all the constants used in the application.
 * @created 18/8/24
 */
object AppConstants {
    const val SPRING_PROFILE_DEVELOPMENT = "dev"
    const val SPRING_PROFILE_TEST = "test"
    const val SPRING_PROFILE_PRODUCTION = "prod"
    const val SPRING_PROFILE_SWAGGER = "swagger"
    const val SPRING_PROFILE_NO_LIQUIBASE = "no-liquibase"

    const val UUID_PATTERN = "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$"

    object Paths {
        const val API = "/api"
    }
}
