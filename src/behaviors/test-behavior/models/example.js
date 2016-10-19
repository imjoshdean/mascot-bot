export default function example(db) {
  const Example = db.define('example', {
    name: {
      type: db.STRING,
      field: 'name'
    }
  });

  Example.sync();

  return Example;
};