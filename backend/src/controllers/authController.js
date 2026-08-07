import {login, getDirectorioAlias} from '../services/authService.js';
import {generateToken} from '../utils/token.js';

/*Controlador para credenciales en login*/
export const loginHandler = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({message: 'Rellene los campos solicitados'});
  }
  try {
    const result = await login(username, password);
    if (!result) {
      return res.status(401).json({message: 'Credenciales Incorrectas'});
    }
    const token = generateToken({
      codEmp: result.codEmp,
      alias: result.alias,
      idCargo: result.idCargo,
      isDirectorio: result.isDirectorio,
      permissions: result.permissions
    });
    return res.json({
      token,
      alias: result.alias,
      isDirectorio: result.isDirectorio,
      permissions: result.permissions
    });
  } 
  catch (error) {
    return res.status(500).json({message: 'Error al acceder a la base de datos'});
  }
};

/*Recuperacion de alias de directorio para rellenar en login*/
export const directorioAliasHandler = async (req, res) => {
  try {
    const alias = await getDirectorioAlias();
    if (!alias) {
      return res.status(404).json({message: 'No se encontraron datos de directorio'});
    }
    return res.json({ alias });
  } 
  catch (error) {
    return res.status(500).json({message: 'Error al acceder a la base de datos'});
  }
};