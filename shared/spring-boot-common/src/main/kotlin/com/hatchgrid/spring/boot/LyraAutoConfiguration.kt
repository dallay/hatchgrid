package com.hatchgrid.spring.boot

import com.hatchgrid.common.domain.bus.Mediator
import com.hatchgrid.common.domain.bus.MediatorBuilder
import org.springframework.boot.autoconfigure.AutoConfiguration
import org.springframework.context.ApplicationContext
import org.springframework.context.annotation.Bean

@AutoConfiguration
open class HatchgridAutoConfiguration {
    @Bean
    open fun hatchgridSpringBeanProvider(applicationContext: ApplicationContext): HatchgridSpringBeanProvider =
        HatchgridSpringBeanProvider(applicationContext)

    @Bean
    open fun mediator(hatchgridSpringBeanProvider: HatchgridSpringBeanProvider): Mediator =
        MediatorBuilder(hatchgridSpringBeanProvider).build()
}
