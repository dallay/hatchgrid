@file:Suppress("UNCHECKED_CAST")

package com.hatchgrid.spring.boot

import com.hatchgrid.common.domain.bus.DependencyProvider
import org.springframework.context.ApplicationContext

class HatchgridSpringBeanProvider(
    private val applicationContext: ApplicationContext,
) : DependencyProvider {
    override fun <T> getSingleInstanceOf(clazz: Class<T>): T = applicationContext.getBean(clazz)

    override fun <T> getSubTypesOf(clazz: Class<T>): Collection<Class<T>> =
        applicationContext.getBeanNamesForType(clazz)
            .map { applicationContext.getType(it) as Class<T> }
}
