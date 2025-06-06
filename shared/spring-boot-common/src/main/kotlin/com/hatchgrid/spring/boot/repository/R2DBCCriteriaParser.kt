package com.hatchgrid.spring.boot.repository

import com.hatchgrid.common.domain.criteria.Criteria
import com.hatchgrid.common.domain.criteria.CriteriaParser
import kotlin.reflect.KClass
import kotlin.reflect.KProperty
import kotlin.reflect.full.memberProperties
import kotlin.reflect.jvm.javaField
import org.springframework.data.relational.core.mapping.Column
import org.springframework.data.relational.core.query.Criteria as R2DBCCriteria
import org.springframework.data.relational.core.query.Criteria.CriteriaStep as R2DBCCriteriaStep

/**
 *
 * @created 10/1/24
 */
@Suppress("MethodOverloading")
class R2DBCCriteriaParser<T : Any>(
    clazz: KClass<T>
) : CriteriaParser<R2DBCCriteria> {
    private val columnNames = clazz.memberProperties.associate { it.name to columnName(it) }

    @Suppress("CyclomaticComplexMethod", "CognitiveComplexMethod")
    override fun parse(criteria: Criteria): R2DBCCriteria {
        return when (criteria) {
            is Criteria.Empty -> R2DBCCriteria.empty()
            is Criteria.And -> parse(criteria)
            is Criteria.Or -> parse(criteria)
            is Criteria.Equals -> parse(criteria)
            is Criteria.NotEquals -> parse(criteria)
            is Criteria.Between -> parse(criteria)
            is Criteria.NotBetween -> parse(criteria)
            is Criteria.LessThan -> parse(criteria)
            is Criteria.LessThanEquals -> parse(criteria)
            is Criteria.GreaterThan -> parse(criteria)
            is Criteria.GreaterThanEquals -> parse(criteria)
            is Criteria.IsNull -> parse(criteria)
            is Criteria.IsNotNull -> parse(criteria)
            is Criteria.Like -> parse(criteria)
            is Criteria.Ilike -> parse(criteria)
            is Criteria.NotLike -> parse(criteria)
            is Criteria.In -> parse(criteria)
            is Criteria.NotIn -> parse(criteria)
            is Criteria.IsTrue -> parse(criteria)
            is Criteria.IsFalse -> parse(criteria)
            else -> throw IllegalArgumentException("Criteria $criteria is not supported")
        }
    }

    private fun parse(criteria: Criteria.And): R2DBCCriteria {
        if (criteria.value.isEmpty()) {
            return R2DBCCriteria.empty()
        }
        if (criteria.value.size == 1) {
            return parse(criteria.value[0])
        }
        return criteria.value
            .filter { it !is Criteria.Empty }
            .map { parse(it) }
            .reduce { acc, cur -> acc.and(cur) }
    }

    private fun parse(criteria: Criteria.Or): R2DBCCriteria {
        if (criteria.value.isEmpty()) {
            return R2DBCCriteria.empty()
        }
        if (criteria.value.size == 1) {
            return parse(criteria.value[0])
        }
        return criteria.value
            .filter { it !is Criteria.Empty }
            .map { parse(it) }
            .reduce { acc, cur -> acc.or(cur) }
    }

    private fun parse(criteria: Criteria.Equals): R2DBCCriteria = where(criteria.key).`is`(criteria.value)

    private fun parse(criteria: Criteria.NotEquals): R2DBCCriteria = where(criteria.key).not(criteria.value)

    private fun parse(criteria: Criteria.Between): R2DBCCriteria =
        where(criteria.key).between(criteria.value.start, criteria.value.endInclusive)

    private fun parse(criteria: Criteria.NotBetween): R2DBCCriteria =
        where(criteria.key).notBetween(criteria.value.start, criteria.value.endInclusive)

    private fun parse(criteria: Criteria.LessThan): R2DBCCriteria =
        where(criteria.key).lessThan(criteria.value)

    private fun parse(criteria: Criteria.LessThanEquals): R2DBCCriteria =
        where(criteria.key).lessThanOrEquals(criteria.value)

    private fun parse(criteria: Criteria.GreaterThan): R2DBCCriteria =
        where(criteria.key).greaterThan(criteria.value)

    private fun parse(criteria: Criteria.GreaterThanEquals): R2DBCCriteria =
        where(criteria.key).greaterThanOrEquals(criteria.value)

    private fun parse(criteria: Criteria.IsNull): R2DBCCriteria = where(criteria.key).isNull

    private fun parse(criteria: Criteria.IsNotNull): R2DBCCriteria = where(criteria.key).isNotNull

    private fun parse(criteria: Criteria.Like): R2DBCCriteria =
        where(criteria.key).like(criteria.value)

    private fun parse(criteria: Criteria.Ilike): R2DBCCriteria =
        where(criteria.key).like(criteria.value).ignoreCase(true)

    private fun parse(criteria: Criteria.NotLike): R2DBCCriteria =
        where(criteria.key).notLike(criteria.value)

    private fun parse(criteria: Criteria.In): R2DBCCriteria = where(criteria.key).`in`(criteria.value)

    private fun parse(criteria: Criteria.NotIn): R2DBCCriteria =
        where(criteria.key).notIn(criteria.value)

    private fun parse(criteria: Criteria.IsTrue): R2DBCCriteria = where(criteria.key).isTrue

    private fun parse(criteria: Criteria.IsFalse): R2DBCCriteria = where(criteria.key).isFalse

    private fun where(key: String): R2DBCCriteriaStep {
        return R2DBCCriteria.where(
            columnNames[key] ?: throw IllegalArgumentException("$key is invalid}"),
        )
    }
}

fun <T> columnName(property: KProperty<T>): String {
    val column = property
        .javaField
        ?.annotations
        ?.filterIsInstance<Column>()
        ?.firstOrNull()

    return column?.value ?: property.name
}
