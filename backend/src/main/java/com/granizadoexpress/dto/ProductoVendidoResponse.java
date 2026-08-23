package com.granizadoexpress.dto;

import java.math.BigDecimal;

public record ProductoVendidoResponse(String productoNombre, long unidadesVendidas, BigDecimal total) {}