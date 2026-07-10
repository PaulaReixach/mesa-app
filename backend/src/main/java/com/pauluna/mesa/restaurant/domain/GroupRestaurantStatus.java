package com.pauluna.mesa.restaurant.domain;

public enum GroupRestaurantStatus {

    WANT_TO_GO,
    VISITED,
    WANT_TO_REPEAT,
    DO_NOT_REPEAT,
    ARCHIVED,

    /**
     * Valor legado conservado únicamente para compatibilidad durante la
     * migración de datos. Favorito ya no es un estado seleccionable.
     */
    @Deprecated
    FAVORITE
}
