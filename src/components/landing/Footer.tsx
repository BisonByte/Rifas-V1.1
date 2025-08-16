export function Footer() {
  const currentYear = new Date().getFullYear()

  const socialLinks = [
    { name: 'Facebook', icon: '📘', url: 'https://facebook.com/sistemarifas' },
    { name: 'Instagram', icon: '📷', url: 'https://instagram.com/sistemarifas' },
    { name: 'Twitter', icon: '🐦', url: 'https://twitter.com/sistemarifas' },
    { name: 'YouTube', icon: '📺', url: 'https://youtube.com/sistemarifas' },
    { name: 'TikTok', icon: '🎵', url: 'https://tiktok.com/@sistemarifas' }
  ]

  const whatsappNumbers = [
    { name: 'Ventas', number: '+1234567890', message: 'Hola, quiero información sobre la rifa' },
    { name: 'Soporte', number: '+1234567891', message: 'Hola, necesito ayuda con mi ticket' },
    { name: 'Ganadores', number: '+1234567892', message: 'Hola, creo que gané la rifa' }
  ]

  const quickLinks = [
    { name: 'Participar', href: '#participar' },
    { name: 'Verificar Ticket', href: '#verificar' },
    { name: 'Premios', href: '#premios' },
    { name: 'FAQ', href: '#faq' },
    { name: 'Sorteo en Vivo', href: '/sorteo' },
    { name: 'Ganadores', href: '/ganadores' }
  ]

  const legalLinks = [
    { name: 'Términos y Condiciones', href: '/terminos' },
    { name: 'Política de Privacidad', href: '/privacidad' },
    { name: 'Política de Cookies', href: '/cookies' },
    { name: 'Contacto', href: '/contacto' }
  ]

  const scrollToSection = (href: string) => {
    if (href.startsWith('#')) {
      const element = document.getElementById(href.substring(1))
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        {/* Sección principal */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Información de la empresa */}
          <div className="lg:col-span-1">
            <h3 className="text-2xl font-bold mb-4">🎉 Sistema de Rifas</h3>
            <p className="text-gray-300 mb-4 leading-relaxed">
              Participa en nuestras rifas transparentes y seguras. 
              Elige tus números, gana increíbles premios y disfruta 
              de una experiencia completamente confiable.
            </p>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span>🏢</span>
                <span>Sistema de Rifas S.A.</span>
              </div>
              <div className="flex items-center gap-2">
                <span>📍</span>
                <span>123 Calle Principal, Ciudad, País</span>
              </div>
              <div className="flex items-center gap-2">
                <span>📧</span>
                <a href="mailto:info@sistemarifas.com" className="hover:text-blue-400 transition-colors">
                  info@sistemarifas.com
                </a>
              </div>
            </div>
          </div>

          {/* Enlaces rápidos */}
          <div>
            <h4 className="text-lg font-semibold mb-4">🔗 Enlaces Rápidos</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  {link.href.startsWith('#') ? (
                    <button
                      onClick={() => scrollToSection(link.href)}
                      className="text-gray-300 hover:text-white transition-colors"
                    >
                      {link.name}
                    </button>
                  ) : (
                    <a
                      href={link.href}
                      className="text-gray-300 hover:text-white transition-colors"
                    >
                      {link.name}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* WhatsApp */}
          <div>
            <h4 className="text-lg font-semibold mb-4">📱 WhatsApp</h4>
            <div className="space-y-3">
              {whatsappNumbers.map((contact) => (
                <div key={contact.name}>
                  <p className="text-sm font-medium text-gray-200 mb-1">{contact.name}</p>
                  <a
                    href={`https://wa.me/${contact.number.replace('+', '')}?text=${encodeURIComponent(contact.message)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-400 hover:text-green-300 transition-colors text-sm flex items-center gap-1"
                  >
                    <span>📱</span>
                    {contact.number}
                  </a>
                </div>
              ))}
            </div>
            
            <div className="mt-4 p-3 bg-green-800/20 rounded-lg border border-green-700/30">
              <p className="text-xs text-green-300">
                💡 <strong>Tip:</strong> Guarda nuestros números en tu agenda 
                para recibir actualizaciones importantes sobre tu participación.
              </p>
            </div>
          </div>

          {/* Redes sociales */}
          <div>
            <h4 className="text-lg font-semibold mb-4">🌐 Síguenos</h4>
            <div className="space-y-3 mb-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors"
                >
                  <span className="text-xl">{social.icon}</span>
                  <span>{social.name}</span>
                </a>
              ))}
            </div>
            
            <div className="p-3 bg-blue-800/20 rounded-lg border border-blue-700/30">
              <p className="text-xs text-blue-300">
                🔴 <strong>Sorteo en vivo:</strong> No te pierdas la transmisión 
                del sorteo por Facebook e Instagram Live.
              </p>
            </div>
          </div>
        </div>

        {/* Información importante */}
        <div className="border-t border-gray-700 pt-8 mb-8">
          <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-lg p-4">
            <h4 className="text-yellow-300 font-semibold mb-2 flex items-center gap-2">
              ⚠️ Aviso Legal Importante
            </h4>
            <p className="text-sm text-yellow-100 leading-relaxed">
              <strong>Responsabilidad:</strong> Las rifas están reguladas y pueden variar según el país/estado. 
              Este sistema describe la funcionalidad técnica. Es responsabilidad del organizador validar 
              todos los requisitos legales y términos con asesoría jurídica local antes de la publicación 
              y operación de cualquier rifa o sorteo.
            </p>
          </div>
        </div>

        {/* Sección legal */}
        <div className="border-t border-gray-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-400">
              <p>&copy; {currentYear} Sistema de Rifas. Todos los derechos reservados.</p>
              <p className="mt-1">
                Desarrollado con ❤️ para sorteos transparentes y seguros
              </p>
            </div>
            
            <div className="flex flex-wrap gap-4 text-sm">
              {legalLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>
          
          {/* Información técnica */}
          <div className="mt-6 pt-4 border-t border-gray-800 text-center">
            <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-500">
              <span>🔒 Conexión segura SSL</span>
              <span>🛡️ Datos protegidos</span>
              <span>⚡ Tiempo real</span>
              <span>📱 Mobile friendly</span>
              <span>♿ Accesible</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
