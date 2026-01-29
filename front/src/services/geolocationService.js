// src/services/geolocationService.js

/**
 * Serviço de Geolocalização
 */
const geolocationService = {
  /**
   * Obtém a posição atual do usuário
   * @returns {Promise<{latitude: number, longitude: number}>}
   */
  async getCurrentPosition() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocalização não é suportada pelo navegador'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          let errorMessage = 'Erro ao obter localização';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Permissão de localização negada. Por favor, habilite nas configurações do navegador.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Localização indisponível no momento.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Tempo esgotado ao tentar obter localização.';
              break;
            default:
              errorMessage = 'Erro desconhecido ao obter localização.';
          }
          
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  },

  /**
   * Calcula distância entre dois pontos usando fórmula de Haversine
   * @param {number} lat1 
   * @param {number} lon1 
   * @param {number} lat2 
   * @param {number} lon2 
   * @returns {number} Distância em metros
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Raio da Terra em metros
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distância em metros
  },

  /**
   * Verifica se usuário está dentro do raio do evento
   * @param {Object} eventoLocal 
   * @param {number} eventoLocal.latitude
   * @param {number} eventoLocal.longitude
   * @param {number} eventoLocal.raioMetros
   * @param {Object} usuarioLocal 
   * @param {number} usuarioLocal.latitude
   * @param {number} usuarioLocal.longitude
   * @returns {boolean}
   */
  isDentroDoRaio(eventoLocal, usuarioLocal) {
    const distancia = this.calculateDistance(
      eventoLocal.latitude,
      eventoLocal.longitude,
      usuarioLocal.latitude,
      usuarioLocal.longitude
    );

    return distancia <= eventoLocal.raioMetros;
  },

  /**
   * Simula validação de geolocalização (para desenvolvimento/testes)
   * @param {number} latitude 
   * @param {number} longitude 
   * @returns {Promise<boolean>}
   */
  async simularValidacao(latitude, longitude) {
    // Simula um delay de rede
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // Para desenvolvimento, sempre retorna true
    // Em produção, isso seria uma chamada real à API
    return true;
  },
};

export default geolocationService;
