import React from 'react';

const STATUS = {
  PENDENTE: { label: "Pendente", className: "bg-yellow-100 text-yellow-800" },
  CONFIRMADA: { label: "Confirmada", className: "bg-green-100 text-green-800" },
  CONFIRMADO: { label: "Confirmado", className: "bg-green-100 text-green-800" },
  REALIZADA: { label: "Realizada", className: "bg-blue-100 text-blue-800" },
  CANCELADA: { label: "Cancelada", className: "bg-red-100 text-red-800" },
  CANCELADO: { label: "Cancelado", className: "bg-red-100 text-red-800" },
  NAO_COMPARECEU: { label: "Não compareceu", className: "bg-gray-200 text-gray-800" },
};

const StatusBadge = ({ status }) => {
  const config = STATUS[status] || { label: status || "-", className: "bg-gray-100 text-gray-800" };

  return (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${config.className}`}>
      {config.label}
    </span>
  );
};

export default StatusBadge;
