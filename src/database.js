import fs from "node:fs/promises";

const databasePath = new URL("../db.json", import.meta.url);

export class Database {
  #database = {};

  constructor() {
    fs.readFile(databasePath, "utf-8")
      .then((data) => {
        this.#database = JSON.parse(data);
      })
      .catch(() => {
        this.#persist();
      });
  }

  #persist() {
    fs.writeFile(databasePath, JSON.stringify(this.#database));
  }

  select(table, search) {
    let data = this.#database[table] ?? [];

    if (search?.id) {
      const rowIndex = this.#database[table].findIndex(
        (row) => row.id === search?.id
      );

      if (rowIndex === -1) {
        return [];
      }
    }

    if (search) {
      data = data.filter((row) => {
        return Object.entries(search).some(([key, value]) => {
          return row[key].includes(value);
        });
      });
    }

    return data;
  }

  insert(table, data) {
    if (Array.isArray(this.#database[table])) {
      this.#database[table].push(data);
    } else {
      this.#database[table] = [data];
    }

    this.#persist();

    return data;
  }

  update(table, id, updatedData) {
    const rowIndex = this.#database[table].findIndex((row) => row.id === id);

    if (rowIndex > -1) {
      const previousData = this.#database[table][rowIndex];

      const taskUpdated = {
        id,
        ...previousData,
        ...updatedData,
        updated_at: new Date(),
      };

      this.#database[table][rowIndex] = taskUpdated;
      this.#persist();
    }
  }

  delete(table, id) {
    const rowIndex = this.#database[table].findIndex((row) => row.id === id);

    if (rowIndex > -1) {
      this.#database[table].splice(rowIndex, 1);
      this.#persist();
    }
  }

  completedTask(table, id) {
    const rowIndex = this.#database[table].findIndex((row) => row.id === id);
    const taskData = this.#database[table].filter((row) => row.id === id);

    if (rowIndex > -1) {
      const updatedTask = {
        ...taskData[0],
        completed_at: new Date(),
      };

      this.#database[table][rowIndex] = updatedTask;
      this.#persist();
    }
  }
}
