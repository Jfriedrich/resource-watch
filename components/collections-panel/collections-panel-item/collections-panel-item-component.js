import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import Spinner from 'components/ui/Spinner';

class CollectionPanelItem extends PureComponent {
  static defaultProps = {
    collection: {},
    isChecked: false,
    onToggleCollection: () => { }
  };

  static propTypes = {
    collection: PropTypes.object,
    isChecked: PropTypes.bool,
    loading: PropTypes.bool,
    onToggleCollection: PropTypes.func
  };

  onCheck = (evt) => {
    const isChecked = evt.currentTarget.checked;
    const { onToggleCollection, collection } = this.props;
    onToggleCollection(isChecked, collection);
  }

  render() {
    const { collection, isChecked, loading } = this.props;
    const { name } = collection;

    const collectionItemClass = classnames({
      'collection-item': true,
      '-selected': isChecked
    });

    return (
      <li className={collectionItemClass}>
        {loading && <Spinner
          isLoading={loading}
          className="-transparent -tiny -pink-icon"
          style={{
            left: 'auto',
            right: 5
          }}
        />}
        <span className="fake-checkbox" />
        <input
          type="checkbox"
          name={name}
          onChange={this.onCheck}
          defaultChecked={isChecked}
        />
        <span className="collection-name">{name}</span>
      </li>
    );
  }
}

export default CollectionPanelItem;
