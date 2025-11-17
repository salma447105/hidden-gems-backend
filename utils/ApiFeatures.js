export class ApiFeatures {

    constructor(mongooseQuery, queryString) {

        // console.log('🔍 mongooseQuery type:', typeof mongooseQuery);
        // console.log('🔍 mongooseQuery methods:', Object.getOwnPropertyNames(mongooseQuery));
        // console.log('🔍 Has skip method?', typeof mongooseQuery.skip === 'function');
    
        this.mongooseQuery = mongooseQuery
        this.queryString = queryString
    }

    //1-pagination
    paginate() {
        let page = this.queryString.page * 1 || 1
        if (this.queryString.page <= 0) page = 1
        let skip = (page - 1) * 5 //(limit)
        this.page = page
        this.mongooseQuery.skip(skip).limit(5)
        return this
    }

    //2-filter
    filter() {
        let filterObj = { ...this.queryString }
        let exclude = ['page', 'sort', 'fields', 'keyword']
        exclude.forEach((e) => {
            delete filterObj[e]
        })
        filterObj = JSON.stringify(filterObj)
        filterObj = filterObj.replace(/\b(gt|gte|lt|lte)\b/g, match => `$${match}`)
        filterObj = JSON.parse(filterObj)
        this.mongooseQuery.find(filterObj)
        return this
    }


    //3-sort
    sort() {
        if (this.queryString.sort) {
            let sortedBy = this.queryString.sort.split(',').join(' ')
            this.mongooseQuery.sort(sortedBy)
        }
        return this
    }

    //4-search
    search() {
        if (this.queryString.keyword) {
            mongooseQuery.find({
                $or: [
                    { title: { $regex: this.queryString.keyword, $options: "i" } },
                    { description: { $regex: this.queryString.keyword, $options: "i" } },
                ]
            })
        }
        return this
    }


    //5-select fields
    fields() {
        if (this.queryString.fields) {
            let fields = this.queryString.fields.split(',').join(' ')
            this.mongooseQuery.select(fields)
        }
        return this
    }

}