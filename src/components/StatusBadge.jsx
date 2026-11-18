import React from 'react';

const StatusBadge = ({ status }) => {
  const config = {
    PENDENTE: {
      label: "Pendente",
      classes: "bg-yellow-100 text-yellow-800 border border-yellow-200"
    },
    CONFIRMADA: {
      label: "Confirmada",
      classes: "bg-green-100 text-green-800 border border-green-200"
    },
    REALIZADA: {
      label: "Realizada",
      classes: "bg-blue-100 text-blue-800 border border-blue-200"
    },
    CONCLUIDA: {
      label: "Realizada",
      classes: "bg-blue-100 text-blue-800 border border-blue-200"
    },
    CANCELADA: {
      label: "Cancelada",
      classes: "bg-red-100 text-red-800 border border-red-200"
    },
    NAO_COMPARECEU: {
      label: "Não Compareceu",
      classes: "bg-gray-200 text-gray-800 border border-gray-300"
    }
  };

  const current = config[status] || {
    label: status || "Desconhecido",
    classes: "bg-gray-100 text-gray-800"
  };

  return (
    <span className={`px-3 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${current.classes}`}>
      {current.label}
    </span>
  );
};

export default StatusBadge;