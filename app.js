// var React       = require('react'),
//     ReactDOM    = require('react-dom'),
//     Theater     = require('./components/Theater.react');

// var id = document.getElementById('state').innerHTML;

// ReactDOM.render(
//     <Theater id={id}/>,
//     document.getElementById('theater')
// );

import React from 'react';
import ReactDOM from 'react-dom';
import Theater from './components/Theater.react';

var id = $('#state').text();

ReactDOM.render(
    <Theater id={id} />,
    $('#react')[0]
);