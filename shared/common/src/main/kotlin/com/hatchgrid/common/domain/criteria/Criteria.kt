package com.hatchgrid.common.domain.criteria

import java.util.regex.Pattern

open class CriteriaLike(open val key: String, open val value: String) : Criteria() {
    override fun toString(): String = "$key LIKE $value"
}

sealed class Criteria {
    object Empty : Criteria() {
        override fun toString(): String = "()"
    }

    data class And(val value: List<Criteria>) : Criteria() {
        override fun toString(): String = "(${value.joinToString(" AND ") { it.toString() }})"
    }

    data class Or(val value: List<Criteria>) : Criteria() {
        override fun toString(): String = "(${value.joinToString(" OR ") { it.toString() }})"
    }

    data class Equals(val key: String, val value: Any) : Criteria() {
        override fun toString(): String = "$key = $value"
    }

    data class NotEquals(val key: String, val value: Any) : Criteria() {
        override fun toString(): String = "$key != $value"
    }

    data class Between(val key: String, val value: ClosedRange<*>) : Criteria() {
        override fun toString(): String = "($key >= ${value.start} && $key <= ${value.endInclusive})"
    }

    data class NotBetween(val key: String, val value: ClosedRange<*>) : Criteria() {
        override fun toString(): String = "($key < ${value.start} || $key > ${value.endInclusive})"
    }

    data class LessThan(val key: String, val value: Any) : Criteria() {
        override fun toString(): String = "$key < $value"
    }

    data class LessThanEquals(val key: String, val value: Any) : Criteria() {
        override fun toString(): String = "$key <= $value"
    }

    data class GreaterThan(val key: String, val value: Any) : Criteria() {
        override fun toString(): String = "$key > $value"
    }

    data class GreaterThanEquals(val key: String, val value: Any) : Criteria() {
        override fun toString(): String = "$key >= $value"
    }

    data class IsNull(val key: String) : Criteria() {
        override fun toString(): String = "$key = null"
    }

    data class IsNotNull(val key: String) : Criteria() {
        override fun toString(): String = "$key != null"
    }

    data class Like(override val key: String, override val value: String) : CriteriaLike(key, value) {
        override fun toString(): String = "$key LIKE $value"
    }

    data class Ilike(override val key: String, override val value: String) : CriteriaLike(key, value) {
        override fun toString(): String = "$key ILIKE $value"
    }

    data class NotLike(val key: String, val value: String) : Criteria() {
        override fun toString(): String = "$key NOT LIKE $value"
    }

    data class Regexp(val key: String, val value: Pattern) : Criteria() {
        override fun toString(): String = "$key REGEXP $value"
    }

    data class NotRegexp(val key: String, val value: Pattern) : Criteria() {
        override fun toString(): String = "$key NOT REGEXP $value"
    }

    data class In(val key: String, val value: List<Any?>) : Criteria() {
        override fun toString(): String =
            "$key IN [${value.joinToString { it?.toString() ?: "null" }}]"
    }

    data class NotIn(val key: String, val value: List<Any?>) : Criteria() {
        override fun toString(): String =
            "$key NOT IN [${value.joinToString { it?.toString() ?: "null" }}]"
    }
    data class IsTrue(val key: String) : Criteria() {
        override fun toString(): String = "$key IS TRUE"
    }

    data class IsFalse(val key: String) : Criteria() {
        override fun toString(): String = "$key IS FALSE"
    }
}
