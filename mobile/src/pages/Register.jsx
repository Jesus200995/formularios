import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css';

const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState('forward');
  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    email: '',
    curp: '',
    territorio: '',
    puesto: '',
    supervisor: '',
    telefono: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ level: '', text: '' });
  const [acceptTerms, setAcceptTerms] = useState(false);

  const totalSteps = 3;

  // Calcular fortaleza de contraseña
  useEffect(() => {
    const pwd = formData.password;
    if (!pwd) {
      setPasswordStrength({ level: '', text: '' });
      return;
    }
    
    let strength = 0;
    if (pwd.length >= 4) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    
    if (strength <= 1) {
      setPasswordStrength({ level: 'weak', text: 'Débil' });
    } else if (strength === 2) {
      setPasswordStrength({ level: 'medium', text: 'Media' });
    } else {
      setPasswordStrength({ level: 'strong', text: 'Fuerte' });
    }
  }, [formData.password]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const validateStep = (currentStep) => {
    switch (currentStep) {
      case 1:
        if (!formData.nombre.trim()) return 'Ingresa tu nombre';
        if (!formData.apellidos.trim()) return 'Ingresa tus apellidos';
        if (!formData.email.trim()) return 'Ingresa tu correo electrónico';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return 'Correo electrónico inválido';
        if (!formData.curp.trim()) return 'Ingresa tu CURP';
        if (formData.curp.length !== 18) return 'El CURP debe tener 18 caracteres';
        return null;
      case 2:
        if (!formData.territorio.trim()) return 'Selecciona un territorio';
        if (!formData.puesto.trim()) return 'Selecciona un puesto';
        if (!formData.telefono.trim()) return 'Ingresa tu teléfono';
        if (formData.telefono.length < 10) return 'El teléfono debe tener al menos 10 dígitos';
        return null;
      case 3:
        if (!formData.password) return 'Ingresa una contraseña';
        if (formData.password.length < 4) return 'La contraseña debe tener al menos 4 caracteres';
        if (formData.password.length > 6) return 'La contraseña debe tener máximo 6 caracteres';
        if (formData.password !== formData.confirmPassword) return 'Las contraseñas no coinciden';
        if (!acceptTerms) return 'Debes aceptar los términos y condiciones';
        return null;
      default:
        return null;
    }
  };

  const nextStep = () => {
    const validationError = validateStep(step);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');
    setDirection('forward');
    setStep(prev => Math.min(prev + 1, totalSteps));
  };

  const prevStep = () => {
    setError('');
    setDirection('backward');
    setStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateStep(3);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('https://apidata.geodatos.com.mx/api/app-auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: formData.nombre,
          apellidos: formData.apellidos,
          email: formData.email,
          curp: formData.curp,
          territorio: formData.territorio,
          puesto_trabajo: formData.puesto,
          supervisor: formData.supervisor || null,
          telefono: formData.telefono,
          password: formData.password,
          password_confirm: formData.confirmPassword
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => navigate('/login'), 3000);
      } else {
        setError(data.message || 'Error al registrar. Intenta de nuevo.');
      }
    } catch (err) {
      console.error('Error de registro:', err);
      setError('Error de conexión. Verifica tu internet e intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Calcular ancho de la línea de progreso
  const progressWidth = `calc(${((step - 1) / (totalSteps - 1)) * 100}% - ${step === 1 ? 0 : 16}px)`;

  if (success) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="success-message">
            <div className="success-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <h3>¡Registro exitoso!</h3>
            <p>Tu cuenta ha sido creada correctamente. Serás redirigido al inicio de sesión.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Header */}
        <div className="auth-header">
          <div className="auth-logo">
            <svg className="auth-logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
            <div className="auth-logo-text">
              <span className="auth-logo-title">DATA</span>
              <span className="auth-logo-subtitle">FORMULARIOS</span>
            </div>
          </div>
          <h1 className="auth-title">Crear cuenta</h1>
          <p className="auth-subtitle">Completa los siguientes pasos</p>
        </div>

        {/* Barra de progreso */}
        <div className="progress-container">
          <div className="progress-steps">
            <div 
              className="progress-line" 
              style={{ width: progressWidth }}
            />
            {[1, 2, 3].map((num) => (
              <div
                key={num}
                className={`progress-step ${step === num ? 'active' : ''} ${step > num ? 'completed' : ''}`}
              >
                {step > num ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                ) : (
                  num
                )}
              </div>
            ))}
          </div>
          <div className="progress-labels">
            <span className={`progress-label ${step >= 1 ? 'active' : ''}`}>Personal</span>
            <span className={`progress-label ${step >= 2 ? 'active' : ''}`}>Laboral</span>
            <span className={`progress-label ${step >= 3 ? 'active' : ''}`}>Seguridad</span>
          </div>
        </div>

        {/* Formulario */}
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className={`step-content ${direction === 'backward' ? 'step-back' : ''}`}>
            
            {/* Step 1: Datos personales */}
            {step === 1 && (
              <>
                <div className="input-row">
                  <div className="input-group">
                    <label className="input-label">Nombre</label>
                    <div className="input-wrapper">
                      <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                      <input
                        type="text"
                        name="nombre"
                        className="input-field"
                        placeholder="Juan"
                        value={formData.nombre}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="input-group">
                    <label className="input-label">Apellidos</label>
                    <div className="input-wrapper">
                      <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                      <input
                        type="text"
                        name="apellidos"
                        className="input-field"
                        placeholder="Pérez López"
                        value={formData.apellidos}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label">Correo electrónico</label>
                  <div className="input-wrapper">
                    <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="4" width="20" height="16" rx="2"/>
                      <path d="m22 6-10 7L2 6"/>
                    </svg>
                    <input
                      type="email"
                      name="email"
                      className="input-field"
                      placeholder="ejemplo@correo.com"
                      value={formData.email}
                      onChange={handleChange}
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label">
                    CURP
                    <span className="tooltip" data-tip="18 caracteres alfanuméricos">?</span>
                  </label>
                  <div className="input-wrapper">
                    <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="16" rx="2"/>
                      <path d="M7 8h10M7 12h6"/>
                    </svg>
                    <input
                      type="text"
                      name="curp"
                      className="input-field"
                      placeholder="XXXX000000XXXXXX00"
                      value={formData.curp}
                      onChange={handleChange}
                      maxLength={18}
                      style={{ textTransform: 'uppercase' }}
                    />
                  </div>
                </div>
              </>
            )}

            {/* Step 2: Datos laborales */}
            {step === 2 && (
              <>
                <div className="input-group">
                  <label className="input-label">Territorio</label>
                  <div className="input-wrapper">
                    <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                    <select
                      name="territorio"
                      className="input-field"
                      value={formData.territorio}
                      onChange={handleChange}
                    >
                      <option value="">Selecciona un territorio</option>
                      <option value="Acapulco - Centro - Norte - Tierra Caliente">Acapulco - Centro - Norte - Tierra Caliente</option>
                      <option value="Acayucan">Acayucan</option>
                      <option value="Balancán">Balancán</option>
                      <option value="Chihuahua / Sonora">Chihuahua / Sonora</option>
                      <option value="Colima">Colima</option>
                      <option value="Comalcalco">Comalcalco</option>
                      <option value="Córdoba">Córdoba</option>
                      <option value="Costa Chica - Montaña">Costa Chica - Montaña</option>
                      <option value="Costa Grande - Sierra">Costa Grande - Sierra</option>
                      <option value="Durango / Zacatecas">Durango / Zacatecas</option>
                      <option value="Hidalgo">Hidalgo</option>
                      <option value="Istmo">Istmo</option>
                      <option value="Michoacán">Michoacán</option>
                      <option value="Mixteca">Mixteca</option>
                      <option value="Morelos">Morelos</option>
                      <option value="Nayarit / Jalisco">Nayarit / Jalisco</option>
                      <option value="Ocosingo">Ocosingo</option>
                      <option value="Palenque">Palenque</option>
                      <option value="Papantla">Papantla</option>
                      <option value="Pichucalco">Pichucalco</option>
                      <option value="Puebla">Puebla</option>
                      <option value="San Luis Potosí">San Luis Potosí</option>
                      <option value="Sinaloa">Sinaloa</option>
                      <option value="Tamaulipas">Tamaulipas</option>
                      <option value="Tantoyuca">Tantoyuca</option>
                      <option value="Tapachula">Tapachula</option>
                      <option value="Teapa">Teapa</option>
                      <option value="Tlaxcala / Estado de México">Tlaxcala / Estado de México</option>
                      <option value="Tzucacab / Opb">Tzucacab / Opb</option>
                      <option value="Xpujil">Xpujil</option>
                      <option value="Oficinas Centrales">Oficinas Centrales</option>
                    </select>
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label">Puesto</label>
                  <div className="input-wrapper">
                    <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="7" width="20" height="14" rx="2"/>
                      <path d="M16 7V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v3"/>
                    </svg>
                    <select
                      name="puesto"
                      className="input-field"
                      value={formData.puesto}
                      onChange={handleChange}
                    >
                      <option value="">Selecciona un puesto</option>
                      <option value="TECNICO PRODUCTIVO">TECNICO PRODUCTIVO</option>
                      <option value="TECNICO SOCIAL">TECNICO SOCIAL</option>
                      <option value="FACILITADOR COMUNITARIO">FACILITADOR COMUNITARIO</option>
                      <option value="COORDINACION TERRITORIAL">COORDINACION TERRITORIAL</option>
                      <option value="ESPECIALISTAS PRODUCTIVOS Y SOCIALES">ESPECIALISTAS PRODUCTIVOS Y SOCIALES</option>
                    </select>
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label">Supervisor (opcional)</label>
                  <div className="input-wrapper">
                    <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                    <input
                      type="text"
                      name="supervisor"
                      className="input-field"
                      placeholder="Nombre del supervisor"
                      value={formData.supervisor}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label">Teléfono</label>
                  <div className="input-wrapper">
                    <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                    <input
                      type="tel"
                      name="telefono"
                      className="input-field"
                      placeholder="55 1234 5678"
                      value={formData.telefono}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </>
            )}

            {/* Step 3: Contraseña */}
            {step === 3 && (
              <>
                <div className="input-group">
                  <label className="input-label">Contraseña</label>
                  <div className="input-wrapper">
                    <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      className="input-field"
                      placeholder="4 a 6 caracteres"
                      value={formData.password}
                      onChange={handleChange}
                      autoComplete="new-password"
                      maxLength={6}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                          <line x1="1" y1="1" x2="23" y2="23"/>
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      )}
                    </button>
                  </div>
                  {formData.password && (
                    <div className="password-strength">
                      <div className="strength-bar">
                        <div className={`strength-fill ${passwordStrength.level}`}></div>
                      </div>
                      <span className={`strength-text ${passwordStrength.level}`}>
                        Seguridad: {passwordStrength.text}
                      </span>
                    </div>
                  )}
                </div>

                <div className="input-group">
                  <label className="input-label">Confirmar contraseña</label>
                  <div className="input-wrapper">
                    <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      <circle cx="12" cy="16" r="1"/>
                    </svg>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      className="input-field"
                      placeholder="Repite tu contraseña"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      autoComplete="new-password"
                      maxLength={6}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                          <line x1="1" y1="1" x2="23" y2="23"/>
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div className="terms-check">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                  />
                  <label htmlFor="terms">
                    Acepto los <a href="/terms">Términos y Condiciones</a> y la <a href="/privacy">Política de Privacidad</a>
                  </label>
                </div>
              </>
            )}
          </div>

          {/* Error message */}
          {error && (
            <div className="input-error">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Botones de navegación */}
          <div className="btn-group">
            {step > 1 && (
              <button type="button" className="btn btn-back" onClick={prevStep}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
              </button>
            )}
            
            {step < totalSteps ? (
              <button type="button" className="btn btn-primary" onClick={nextStep}>
                Continuar
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
            ) : (
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? (
                  <>
                    <span className="btn-spinner"></span>
                    Registrando...
                  </>
                ) : (
                  <>
                    Crear cuenta
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                      <polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                  </>
                )}
              </button>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="auth-footer">
          <p>
            ¿Ya tienes una cuenta?
            <Link to="/login">Inicia sesión</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
