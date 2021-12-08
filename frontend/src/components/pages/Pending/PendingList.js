import React from 'react';

import './PendingList.scss';

import Stack from 'react-bootstrap/Stack';
import PendingListItem from './PendingListItem';
import Spinner from './../../Spinner/Spinner';

import moment from 'moment';


function PendingList(props) {
  const listItemsCreatedByMe = props.listItems.filter((item) => item.creator_id === props.currentUserId);
  const listItemsInvitations = props.listItems.filter((item) => item.creator_id !== props.currentUserId);
  return (
    <div className="my-3 pending-list">
      <h5>Created by me</h5>
      <CreatedByMe
        {...props}
        listItems={listItemsCreatedByMe}
        // isLoading={props.isLoading}
        // currentUserId={props.currentUserId}
        // handleDelete={props.handleDelete}
        // handleEdit={props.handleEdit}
        // handleEdit={props.handleEdit}
        // showToast={props.showToast}
        // handleRefresh={props.handleRefresh}
      />
      <h5>Invitations</h5>
      <Invitations
        {...props}
        listItems={listItemsInvitations}
        // isLoading={props.isLoading}
        // currentUserId={props.currentUserId}
        // handleDelete={props.handleDelete}
        // handleEdit={props.handleEdit}
        // showToast={props.showToast}
        // handleRefresh={props.handleRefresh}
      />
    </div>
  );
}

function CommonList(props) {
  if (props.isLoading) {
    return (
      <Spinner />
    );
  }

  if (props.listItems.length === 0) {
    return (
      <div className="my-3">There are no meetings.</div>
    );
  }
  return (
    <Stack className="mt-1 mb-3" direction="vertical" gap={2}>
      { props.listItems.map(
        (item, index) => {
          let dateComponent = null;
          if (index === 0 || moment(props.listItems[index - 1].proposed_time).date() !== moment(item.proposed_time).date()) {
            dateComponent = (<h6>{ moment(item.proposed_time).format('ddd, MMM Do') }</h6>);
          }
          return (
            <div key={item.id}>
              {dateComponent}
              <PendingListItem
                {...props}
                item={item}
                // currentUserId={props.currentUserId}
                // handleDelete={props.handleDelete}
                // handleEdit={props.handleEdit}
                // showToast={props.showToast}
                // handleRefresh={props.handleRefresh}
              />
            </div>
          );
        }
      )}
    </Stack>
  );
}

function CreatedByMe(props) {
  return (
    <CommonList {...props} />
  );
}

function Invitations(props) {
  return (
    <CommonList {...props} />
  );
}

export default PendingList;
