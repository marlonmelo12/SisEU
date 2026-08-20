// src/services/geolocationService.js

/**
 * Serviço de Geolocalização (Boas Práticas de UX e Validação de Raio)
 */
const geolocationService = {
  /**
   * Obtém a posição atual do usuário via HTML5 Geolocation API
   * @returns {Promise<{latitude: number, longitude: number, accuracy: number}>}
   */
  async getCurrentPosition() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocalização não é suportada pelo seu navegador.'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy || 0, // Precisão da leitura em metros
          });
        },
        (error) => {
          let errorMessage = 'Erro ao obter localização';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Permissão de localização negada. Por favor, ative o acesso ao GPS nas configurações do seu navegador ou dispositivo.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Sinal de GPS indisponível no momento. Certifique-se de estar em um local com sinal de rede/GPS.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Tempo limite esgotado ao buscar localização. Tente novamente.';
              break;
            default:
              errorMessage = 'Erro desconhecido ao obter geolocalização.';
          }
          
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true, // Força uso de hardware GPS
          timeout: 12000,           // 12 segundos limite
          maximumAge: 0,            // Não reaproveita localização antiga em cache
        }
      );
    });
  },

  /**
   * Calcula distância exata entre dois pontos sobre a superfície da Terra (Fórmula de Haversine)
   * @param {number} lat1 Latitude Ponto 1
   * @param {number} lon1 Longitude Ponto 1
   * @param {number} lat2 Latitude Ponto 2
   * @param {number} lon2 Longitude Ponto 2
   * @returns {number} Distância exata em metros
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined) {
      return 0;
    }

    const R = 6371000; // Raio médio da Terra em metros
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return Math.round(R * c); // Retorna metros arredondados
  },

  /**
   * Formata a distância em metros para exibição amigável ao usuário
   * @param {number} distanciaMetros 
   * @returns {string} ex: "45m" ou "1.2km"
   */
  formatarDistancia(distanciaMetros) {
    if (distanciaMetros === null || distanciaMetros === undefined || isNaN(distanciaMetros)) {
      return 'N/A';
    }
    if (distanciaMetros >= 1000) {
      return `${(distanciaMetros / 1000).toFixed(1)} km`;
    }
    return `${Math.round(distanciaMetros)} m`;
  },

  /**
   * Categoriza o nível de precisão da leitura do GPS
   * @param {number} accuracyMetros 
   * @returns {{ label: string, colorClass: string, isOk: boolean }}
   */
  getNivelPrecisao(accuracyMetros) {
    if (!accuracyMetros || accuracyMetros <= 30) {
      return { label: 'Alta (Excelente)', colorClass: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30', isOk: true };
    }
    if (accuracyMetros <= 100) {
      return { label: 'Boa', colorClass: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30', isOk: true };
    }
    if (accuracyMetros <= 300) {
      return { label: 'Moderada', colorClass: 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/30', isOk: true };
    }
    return { label: 'Fraca (Sinal Impreciso)', colorClass: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30', isOk: false };
  },

  /**
   * Verifica se o usuário está dentro do raio máximo do evento
   * @param {Object} eventoLocal { latitude, longitude, raioMetros }
   * @param {Object} usuarioLocal { latitude, longitude }
   * @returns {{ estaDentro: boolean, distancia: number }}
   */
  validarRaio(eventoLocal, usuarioLocal) {
    if (!eventoLocal || !usuarioLocal) {
      return { estaDentro: false, distancia: 0 };
    }

    const distancia = this.calculateDistance(
      eventoLocal.latitude,
      eventoLocal.longitude,
      usuarioLocal.latitude,
      usuarioLocal.longitude
    );

    const raioPermitido = eventoLocal.raioMetros || 100;

    return {
      estaDentro: distancia <= raioPermitido,
      distancia,
      raioPermitido,
    };
  },
};

export default geolocationService;
