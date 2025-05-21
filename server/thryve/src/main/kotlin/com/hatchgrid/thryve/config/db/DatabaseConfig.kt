package com.hatchgrid.thryve.config.db

import io.r2dbc.spi.ConnectionFactoryOptions
import io.r2dbc.spi.Option
import org.slf4j.LoggerFactory
import org.springframework.boot.autoconfigure.r2dbc.ConnectionFactoryOptionsBuilderCustomizer
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.data.convert.CustomConversions
import org.springframework.data.r2dbc.config.EnableR2dbcAuditing
import org.springframework.data.r2dbc.convert.R2dbcCustomConversions
import org.springframework.data.r2dbc.dialect.DialectResolver
import org.springframework.data.r2dbc.repository.config.EnableR2dbcRepositories
import org.springframework.r2dbc.core.DatabaseClient
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
