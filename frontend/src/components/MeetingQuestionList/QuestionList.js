import React from 'react';

//import './QuestionList.scss';

import Stack from 'react-bootstrap/Stack';
import Alert from 'react-bootstrap/Alert';
import QuestionListItem from './QuestionListItem';


function QuestionList(props) {

  if (props.listItems.length === 0) {
    return (
      <div>There are no questions.</div>
    );
  }
  return (
    <Stack direction="vertical" gap={2}>
      { props.listItems.map(
          (item, index) => {
            return (
              <QuestionListItem
                key={item.id}
                {...props}
                item={item}
              />
            )
          }
        )
      }
    </Stack>
  );
}

export default QuestionList;
