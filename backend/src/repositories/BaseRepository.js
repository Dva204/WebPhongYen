/**
 * Base Repository
 * Generic data access layer with CRUD, pagination, filtering, sorting
 */
class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  /**
   * Create a new document
   */
  async create(data) {
    return this.model.create(data);
  }

  /**
   * Find by ID
   */
  async findById(id, populate = '', lean = true) {
    const query = this.model.findById(id);
    if (populate) query.populate(populate);
    if (lean) query.lean();
    return query.exec();
  }

  /**
   * Find one by filter
   */
  async findOne(filter, selectFields = '', lean = true) {
    const query = this.model.findOne(filter);
    if (selectFields) query.select(selectFields);
    if (lean) query.lean();
    return query.exec();
  }

  /**
   * Find all with optional filter
   */
  async findAll(filter = {}, populate = '', lean = true) {
    const query = this.model.find(filter);
    if (populate) query.populate(populate);
    if (lean) query.lean();
    return query.exec();
  }

  /**
   * Update by ID
   */
  async updateById(id, data) {
    return this.model.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
  }

  /**
   * Delete by ID
   */
  async deleteById(id) {
    return this.model.findByIdAndDelete(id);
  }

  /**
   * Count documents
   */
  async count(filter = {}) {
    return this.model.countDocuments(filter);
  }

  /**
   * Paginate with filtering and sorting
   * @param {Object} options - { page, limit, sort, filter, populate, select }
   */
  async paginate(options = {}) {
    const {
      page = 1,
      limit = 12,
      sort = '-createdAt',
      filter = {},
      populate = '',
      select = '',
      lean = true,
    } = options;

    const skip = (page - 1) * limit;
    const total = await this.model.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    let query = this.model
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    if (populate) query = query.populate(populate);
    if (select) query = query.select(select);
    if (lean) query = query.lean();

    const data = await query.exec();

    return {
      data,
      pagination: {
        total,
        totalPages,
        currentPage: page,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  /**
   * Aggregate pipeline
   */
  async aggregate(pipeline) {
    return this.model.aggregate(pipeline);
  }
}

module.exports = BaseRepository;
