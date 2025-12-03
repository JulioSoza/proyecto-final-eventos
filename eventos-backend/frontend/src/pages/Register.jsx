function Register() {
  return (
    <div className="form-container">
      <h1 className="page-title">Registro</h1>
      <p className="page-subtitle">
        Más adelante haremos que este formulario cree usuarios en el backend.
      </p>
      <form>
        <div className="form-group">
          <label htmlFor="name" className="form-label">Nombre</label>
          <input id="name" type="text" className="form-input" />
        </div>
        <div className="form-group">
          <label htmlFor="email" className="form-label">Email</label>
          <input id="email" type="email" className="form-input" />
        </div>
        <div className="form-group">
          <label htmlFor="password" className="form-label">Password</label>
          <input id="password" type="password" className="form-input" />
        </div>
        <button type="submit" className="btn btn-primary">
          Crear cuenta
        </button>
      </form>
    </div>
  );
}

export default Register;
