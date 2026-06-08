import { getDbMode, jsonDb } from '../config/db.js';

const generateId = () => Math.random().toString(36).substring(2, 9) + Date.now().toString(36);

export const createModelHelper = (mongooseModel, collectionName) => {
  return {
    find: async (query = {}) => {
      if (getDbMode() === 'mongodb') {
        return mongooseModel.find(query);
      }
      
      let items = jsonDb.read(collectionName);
      return items.filter(item => {
        for (let key in query) {
          // Handle simple matches and regex/nested fields if needed
          if (query[key] !== undefined) {
            if (item[key] !== query[key]) return false;
          }
        }
        return true;
      });
    },

    findOne: async (query = {}) => {
      if (getDbMode() === 'mongodb') {
        return mongooseModel.findOne(query);
      }
      
      let items = jsonDb.read(collectionName);
      return items.find(item => {
        for (let key in query) {
          if (item[key] !== query[key]) return false;
        }
        return true;
      }) || null;
    },

    findById: async (id) => {
      if (getDbMode() === 'mongodb') {
        return mongooseModel.findById(id);
      }
      
      let items = jsonDb.read(collectionName);
      const strId = id ? id.toString() : '';
      return items.find(item => item._id === strId || item.id === strId) || null;
    },

    create: async (data) => {
      if (getDbMode() === 'mongodb') {
        return mongooseModel.create(data);
      }
      
      let items = jsonDb.read(collectionName);
      const newItem = {
        _id: generateId(),
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      items.push(newItem);
      jsonDb.write(collectionName, items);
      return newItem;
    },

    findByIdAndUpdate: async (id, updateData, options = {}) => {
      if (getDbMode() === 'mongodb') {
        return mongooseModel.findByIdAndUpdate(id, updateData, { new: true, ...options });
      }
      
      let items = jsonDb.read(collectionName);
      const strId = id ? id.toString() : '';
      const index = items.findIndex(item => item._id === strId || item.id === strId);
      if (index === -1) return null;
      
      // Handle Mongoose-style atomic updates like $push or $pull
      if (updateData.$push) {
        for (let key in updateData.$push) {
          items[index][key] = items[index][key] || [];
          items[index][key].push(updateData.$push[key]);
        }
      } else if (updateData.$pull) {
        for (let key in updateData.$pull) {
          if (items[index][key]) {
            const val = updateData.$pull[key];
            items[index][key] = items[index][key].filter(v => v !== val && (v._id !== val && v.id !== val));
          }
        }
      } else {
        items[index] = {
          ...items[index],
          ...updateData,
          updatedAt: new Date().toISOString()
        };
      }
      
      jsonDb.write(collectionName, items);
      return items[index];
    },

    findByIdAndDelete: async (id) => {
      if (getDbMode() === 'mongodb') {
        return mongooseModel.findByIdAndDelete(id);
      }
      
      let items = jsonDb.read(collectionName);
      const strId = id ? id.toString() : '';
      const item = items.find(i => i._id === strId || i.id === strId);
      if (!item) return null;
      
      items = items.filter(i => i._id !== strId && i.id !== strId);
      jsonDb.write(collectionName, items);
      return item;
    },

    // A helper method to populate references in fallback mode
    populate: async (items, populateConfig) => {
      if (getDbMode() === 'mongodb') {
        // Mongoose find already populates if chained, but we can do it inline or let controller use mongoose populate
        return items;
      }

      if (!items) return items;
      const isArray = Array.isArray(items);
      const list = isArray ? items : [items];

      for (let item of list) {
        for (let config of populateConfig) {
          const { path, model, select } = config;
          const refId = item[path];
          if (!refId) continue;

          let refData = null;
          if (Array.isArray(refId)) {
            // Array of references
            refData = [];
            for (let idVal of refId) {
              const res = await model.findById(idVal);
              if (res) refData.push(res);
            }
          } else {
            refData = await model.findById(refId);
          }
          item[path] = refData;
        }
      }

      return isArray ? list : list[0];
    }
  };
};
