// src/hooks/useCheckin.js
import { useState, useCallback, useEffect } from 'react';
import checkinService from '../services/checkinService';
import geolocationService from '../services/geolocationService';
import authService from '../services/authService';

/**
 * Hook de Check-in (Controller)
 */
export const useCheckin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [checkinAtivo, setCheckinAtivo] = useState(null);
  const [gpsPermitido, setGpsPermitido] = useState(false);

  /**
   * Valida PIN e retorna dados do evento/sessão
   */
  const validarPin = useCallback(async (pin) => {
    setLoading(true);
    setError(null);

    try {
      const resultado = await checkinService.validarPin(pin);
      return { success: true, data: resultado };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Solicita permissão de GPS
   */
  const solicitarGPS = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const posicao = await geolocationService.getCurrentPosition();
      setGpsPermitido(true);
      return { success: true, posicao };
    } catch (err) {
      setError(err.message);
      setGpsPermitido(false);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Registra check-in completo (PIN + GPS)
   */
  const realizarCheckin = useCallback(async (pin, eventoId, sessaoId, tipoParticipacao = 'OUVINTE') => {
    setLoading(true);
    setError(null);

    try {
      // 1. Valida PIN
      const validacao = await checkinService.validarPin(pin);
      if (!validacao.valid) {
        throw new Error('PIN inválido');
      }

      // 2. Obtém geolocalização
      const posicao = await geolocationService.getCurrentPosition();

      // 3. Registra check-in
      const checkin = await checkinService.registrarCheckin({
        eventoId: eventoId || validacao.eventoId,
        sessaoId: sessaoId || validacao.sessaoId,
        pin,
        latitude: posicao.latitude,
        longitude: posicao.longitude,
        tipoParticipacao,
      });

      setCheckinAtivo(checkin);
      return { success: true, data: checkin };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Registra checkout
   */
  const realizarCheckout = useCallback(async (pin) => {
    setLoading(true);
    setError(null);

    try {
      if (!checkinAtivo) {
        throw new Error('Nenhum check-in ativo encontrado');
      }

      // 1. Valida PIN
      await checkinService.validarPin(pin);

      // 2. Obtém geolocalização
      const posicao = await geolocationService.getCurrentPosition();

      // 3. Registra checkout
      const checkout = await checkinService.registrarCheckout({
        checkinId: checkinAtivo.id,
        pin,
        latitude: posicao.latitude,
        longitude: posicao.longitude,
      });

      setCheckinAtivo(null);
      return { success: true, data: checkout };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [checkinAtivo]);

  /**
   * Busca check-in ativo do usuário
   */
  const buscarCheckinAtivo = useCallback(async (eventoId) => {
    setLoading(true);
    setError(null);

    try {
      const usuario = authService.getUsuarioLogado();
      if (!usuario) {
        throw new Error('Usuário não autenticado');
      }

      const checkin = await checkinService.buscarCheckinAtivo(usuario.id, eventoId);
      setCheckinAtivo(checkin);
      return { success: true, data: checkin };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Verifica se está dentro do raio do evento
   */
  const verificarRaio = useCallback(async (eventoLocal) => {
    try {
      const posicao = await geolocationService.getCurrentPosition();
      const dentroDoRaio = geolocationService.isDentroDoRaio(eventoLocal, posicao);
      return { success: true, dentroDoRaio, posicao };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  return {
    loading,
    error,
    checkinAtivo,
    gpsPermitido,
    validarPin,
    solicitarGPS,
    realizarCheckin,
    realizarCheckout,
    buscarCheckinAtivo,
    verificarRaio,
  };
};

export default useCheckin;
