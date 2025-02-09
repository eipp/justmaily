import snowflake from 'snowflake-sdk';

class SnowflakeClient {
  constructor(config) {
    if (!config || !config.account || !config.username || !config.password) {
      throw new Error(
        'Invalid configuration for SnowflakeClient. Account, username, and password are required.',
      );
    }
    this.config = config;
    this.connection = null;
    this.connected = false;
  }

  async connect(retries = 5, initialDelay = 1000) {
    let attempt = 0;
    while (attempt < retries) {
      try {
        this.connection = snowflake.createConnection({
          account: this.config.account,
          username: this.config.username,
          password: this.config.password,
          database: this.config.database || 'MY_DATABASE',
          schema: this.config.schema || 'MY_SCHEMA',
          warehouse: this.config.warehouse,
          role: this.config.role,
        });
        await new Promise((resolve, reject) => {
          this.connection.connect((err) => {
            if (err) {
              return reject(err);
            }
            return resolve();
          });
        });
        this.connected = true;
        console.log('Successfully connected to Snowflake.');
        return;
      } catch (error) {
        attempt++;
        console.error(
          `Attempt ${attempt} to connect to Snowflake failed: ${error.message}`,
        );
        if (attempt >= retries) {
          throw new Error(
            'Unable to connect to Snowflake after multiple attempts.',
          );
        }
        await new Promise((resolve) =>
          setTimeout(resolve, initialDelay * Math.pow(2, attempt)),
        );
      }
    }
  }

  ensureConnected() {
    if (!this.connected) {
      throw new Error(
        'Not connected to Snowflake. Please call connect() first.',
      );
    }
  }

  async execute(query, binds = []) {
    this.ensureConnected();
    return new Promise((resolve, reject) => {
      this.connection.execute({
        sqlText: query,
        binds,
        complete: (err, stmt, rows) => {
          if (err) {
            console.error('Error executing query:', err);
            return reject(err);
          }
          resolve(rows);
        },
      });
    });
  }

  // Inserts data (as key/value pairs) into a specified table
  async insert(table, data) {
    if (!table) {
      throw new Error('Table name must be provided.');
    }
    if (!data || typeof data !== 'object') {
      throw new Error('Data must be a valid object.');
    }
    const keys = Object.keys(data);
    const values = keys.map((key) => data[key]);
    const query = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${keys.map(() => '?').join(', ')})`;
    return await this.execute(query, values);
  }
}

export default SnowflakeClient;
