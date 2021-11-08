//import './PageLayout.scss';

import PageActions from './../../PageActions/PageActions';
import PageTabs from './../../PageTabs/PageTabs';

function Pending(props) {
  //const [activeTab, setActiveTab] = setState('home');

  return (
    <>
      <PageActions
        label='Create'
        onClick={(evt) => {console.log('TODO');}}
      />
      <PageTabs />
      Pending
    </>
  );
}

export default Pending;
