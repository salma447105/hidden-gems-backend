export const validation = (schema) => {
  return (req, res, next) => {
    const { id: bodyId, ...bodyWithoutId } = req.body;
    const { id: paramId, ...paramsWithoutId } = req.params;
    const { id: queryId, ...queryWithoutId } = req.query;

    let inputs = {
      ...bodyWithoutId,
      ...paramsWithoutId,
      ...queryWithoutId,
    };

    let { error } = schema.validate(inputs, { abortEarly: false });

    if (error) {
      console.log("error in joi validations", error);
      let errors = error.details.map((e) => e.message);

      return res.status(400).json({ errors });
    }

    next();
  };
};
