const express = require('express');
const bodyParser = require('body-parser');
const googleSheets = require('gsa-sheets');

const key = require('./privateSettings.json');

// TODO(you): Change the value of this string to the spreadsheet id for your
// GSA spreadsheet. See HW5 spec for more information.
const SPREADSHEET_ID = '1d9_ckO_gzGHiqBZWeGWyrWHTVAAeup6GlhpbMSa3u7c';

const app = express();
const jsonParser = bodyParser.json();
const sheet = googleSheets(key.client_email, key.private_key, SPREADSHEET_ID);

app.use(express.static('public'));

async function onGet(req, res) {
  const result = await sheet.getRows();
  const rows = result.rows;
  var ans=[];
  let key=rows[0][0];
  let value=rows[0][1];
  for(var i=1;i<rows.length;i++)
  {
    let tmp = {};
    tmp[key]=rows[i][0];
    tmp[value]=rows[i][1];
    ans.push(tmp);
  }
  console.log(ans);
  res.json(ans);
}
app.get('/api', onGet);

async function onPost(req, res) {
  const messageBody = req.body;
  let tmp;
  console.log(messageBody);
  if(Object.keys(messageBody)[0] === 'name' && Object.keys(messageBody)[1] === 'email')
  {
    tmp=Object.values(messageBody);
      sheet.appendRow(tmp);
      res.json( { status: 'success'} );
  }
  else if(Object.keys(messageBody)[0] === 'email' && Object.keys(messageBody)[1] === 'name')
  {
    let v = Object.values(messageBody);
    tmp=v[0];
    v[0]=v[1];
    v[1]=tmp;
      sheet.appendRow(v);
      res.json( { status: 'success'} );
  }
  else
      res.json( { status: 'something wrong ,pls check your input'} );

}
app.post('/api', jsonParser, onPost);

async function onPatch(req, res) {
  const column  = req.params.column;
  const value  = req.params.value;
  const messageBody = req.body;

  // TODO(you): Implement onPatch.

  res.json( { status: 'unimplemented'} );
}
app.patch('/api/:column/:value', jsonParser, onPatch);

async function onDelete(req, res) {
  const column  = req.params.column;
  const value  = req.params.value;
  const result = await sheet.getRows();
  const rows = result.rows;
  let flag = 0;
  if(column==='name')
  {
    for(var i=1;i<rows.length;i++)
    {
      if(rows[i][0]===value)
      {
        sheet.deleteRow(i);
        flag=1;
        break;
      }
    }
  }
  else if (column === 'email')
  {
      for(var i=1;i<rows.length;i++)
      {
          if(rows[i][1]===value)
          {
              sheet.deleteRow(i);
              flag=1;
              break;
          }
      }
  }
  if(flag === 0)
      res.json({status:"Guys not found , pls check your input again."});
  else
      res.json( { status: 'success'} );
  // TODO(you): Implement onDelete.
}
app.delete('/api/:column/:value',  onDelete);


// Please don't change this; this is needed to deploy on Heroku.
const port = process.env.PORT || 3000;

app.listen(port, function () {
  console.log(`CS193: Server listening on port ${port}!`);
});
