// src/pages/PerfilPage.js
import React from 'react';
import Layout from '../components/layout/Layout';
import { useAuth } from '../hooks/useAuth';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { FiUser, FiCreditCard, FiMail, FiShield } from 'react-icons/fi';
import { formatCPF } from '../utils/formatters';

const PerfilPage = () => {
  const { usuario } = useAuth();

  const getBadgeVariant = (tipo) => {
    switch (tipo) {
      case 'ADMINISTRADOR':
        return 'danger';
      case 'PROFESSOR':
      case 'AVALIADOR':
        return 'primary';
      case 'ESTUDANTE':
      default:
        return 'info';
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <FiUser className="text-primary-500" /> Meu Perfil
          </h1>
        </div>

        <Card className="p-6">
          <div className="flex items-center gap-6 pb-6 border-b border-gray-200 dark:border-gray-700">
            <div className="w-20 h-20 rounded-full bg-primary-500 text-white flex items-center justify-center text-3xl font-bold uppercase shadow-lg">
              {usuario?.nome ? usuario.nome.charAt(0) : 'U'}
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                {usuario?.nome || 'Usuário'}
              </h2>
              <div className="mt-2">
                <Badge variant={getBadgeVariant(usuario?.tipoUsuario)}>
                  {usuario?.tipoUsuario || 'ESTUDANTE'}
                </Badge>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
              <FiCreditCard size={24} className="text-primary-500" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">CPF</p>
                <p className="text-base font-medium text-gray-900 dark:text-white">
                  {usuario?.cpf ? formatCPF(usuario.cpf) : 'Não informado'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
              <FiMail size={24} className="text-primary-500" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">E-mail</p>
                <p className="text-base font-medium text-gray-900 dark:text-white">
                  {usuario?.email || 'Não informado'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 md:col-span-2">
              <FiShield size={24} className="text-primary-500" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Perfil de Acesso</p>
                <p className="text-base font-medium text-gray-900 dark:text-white">
                  {usuario?.tipoUsuario === 'ADMINISTRADOR'
                    ? 'Administrador do Sistema (Acesso Total)'
                    : usuario?.tipoUsuario === 'PROFESSOR' || usuario?.tipoUsuario === 'AVALIADOR'
                    ? 'Avaliador / Professor (Gestão de Avaliações)'
                    : 'Estudante (Participante)'}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default PerfilPage;
