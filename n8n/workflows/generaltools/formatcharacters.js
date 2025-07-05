const input = $input.all()[0].json;
const data = Array.isArray(input) ? input : [input];

const result = data.map(item => ({
    ...item,
    mensaje: item.mensaje.replace(/\n/g, '')
}));

return [{ json: Array.isArray(input) ? result : result[0] }];
