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

    object Paths {
        const val API = "/api"
        const val WORKSPACE = "/workspace"
        const val FORMS = "$WORKSPACE/{workspaceId}/form"
        const val FORMS_ID = "$WORKSPACE/{workspaceId}/form/{formId}"
        const val SUBSCRIBER = "$WORKSPACE/{workspaceId}/newsletter/subscriber"
        const val TAG = "$WORKSPACE/{workspaceId}/tag"
    }
}
