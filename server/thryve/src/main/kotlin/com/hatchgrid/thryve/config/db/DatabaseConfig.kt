package com.hatchgrid.thryve.config.db

import org.slf4j.LoggerFactory
import org.springframework.context.annotation.Configuration
import org.springframework.data.r2dbc.config.EnableR2dbcAuditing
import org.springframework.data.r2dbc.repository.config.EnableR2dbcRepositories
import org.springframework.transaction.annotation.EnableTransactionManagement

@Configuration
@EnableTransactionManagement
@EnableR2dbcRepositories(basePackages = ["com.hatchgrid.*"])
@EnableR2dbcAuditing
class DatabaseConfig {
    companion object {
        private val log = LoggerFactory.getLogger(DatabaseConfig::class.java)
    }
}
