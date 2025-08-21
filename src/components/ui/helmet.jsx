import React from 'react';
import { Helmet as ReactHelmet } from 'react-helmet';

const Helmet = ({ children, ...props }) => {
  return <ReactHelmet {...props}>{children}</ReactHelmet>;
};

export { Helmet };