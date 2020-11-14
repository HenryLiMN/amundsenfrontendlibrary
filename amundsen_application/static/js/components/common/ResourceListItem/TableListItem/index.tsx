// Copyright Contributors to the Amundsen project.
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import * as Avatar from 'react-avatar';
import { Link } from 'react-router-dom';
import { OverlayTrigger, Popover } from 'react-bootstrap';

import { ResourceType, TableResource, TagType } from 'interfaces';

import BookmarkIcon from 'components/common/Bookmark/BookmarkIcon';

import { getSourceDisplayName, getSourceIconClass } from 'config/config-utils';

import BadgeList from 'components/common/BadgeList';
import SchemaInfo from 'components/common/ResourceListItem/SchemaInfo';
import { logClick } from 'ducks/utilMethods';
import TagInfo from 'components/common/Tags/TagInfo';
import { LoggingParams } from '../types';

export interface TableListItemProps {
  table: TableResource;
  logging: LoggingParams;
}

class TableListItem extends React.Component<TableListItemProps, {}> {
  getLink = () => {
    const { table, logging } = this.props;

    return (
      `/table_detail/${table.cluster}/${table.database}/${table.schema}/${table.name}` +
      `?index=${logging.index}&source=${logging.source}`
    );
  };

  generateResourceIconClass = (
    databaseId: string,
    resource: ResourceType
  ): string => {
    return `icon resource-icon ${getSourceIconClass(databaseId, resource)}`;
  };

  render() {
    const { table } = this.props;
    const DUMMY_EMAIL1 = 'henry@sieve.data';
    const DUMMY_TARGET1 = '_blank';
    const DUMMY_DISPLAY_NAME1 = 'Henry Li';
    const DUMMY_EMAIL2 = 'carl@sieve.data';
    const DUMMY_TARGET2 = '_blank';
    const DUMMY_DISPLAY_NAME2 = 'Carl Fernandes';
    const DUMMY_TAGS = [
      {
        tag_count: 5,
        tag_name: 'PII',
        tag_type: TagType.TAG,
      },
      {
        tag_count: 1,
        tag_name: 'Core',
        tag_type: TagType.TAG,
      },
      {
        tag_count: 2,
        tag_name: 'Funnel',
        tag_type: TagType.TAG,
      },
    ];
    const tagBody = DUMMY_TAGS.map((tag, index) => (
      <TagInfo data={tag} key={index} />
    ));

    return (
      <li className="list-group-item clickable">
        <Link
          className="resource-list-item table-list-item"
          to={this.getLink()}
        >
          <div className="resource-info">
            <span
              className={this.generateResourceIconClass(
                table.database,
                table.type
              )}
            />
            <div className="resource-info-text my-auto">
              <div className="resource-name title-2">
                <div className="truncated">
                  {table.schema_description && (
                    <SchemaInfo
                      schema={table.schema}
                      table={table.name}
                      desc={table.schema_description}
                    />
                  )}
                  {!table.schema_description && `${table.schema}.${table.name}`}
                </div>
                <BookmarkIcon
                  bookmarkKey={table.key}
                  resourceType={table.type}
                />
              </div>
              <div className="body-secondary-3 truncated">
                {table.description}
              </div>
            </div>
          </div>
          <div className="resource-owner">
            <div className="resource-owner-label">Owned By</div>
            <div className="resource-owner-avatar">
              <OverlayTrigger
                key={DUMMY_EMAIL1}
                trigger={['hover', 'focus']}
                placement="top"
                overlay={
                  <Popover id="popover-trigger-hover-focus">
                    {DUMMY_EMAIL1}
                  </Popover>
                }
              >
                <Link
                  className="avatar-overlap"
                  onClick={logClick}
                  data-type="frequent-users"
                  to="/"
                  target={DUMMY_TARGET1}
                >
                  <Avatar
                    name={DUMMY_DISPLAY_NAME1}
                    round
                    size={25}
                    style={{ position: 'relative' }}
                  />
                </Link>
              </OverlayTrigger>
            </div>
            <div className="resource-owner-team">(Growth Team)</div>
          </div>
          <div className="resource-frequent-users">
            <div className="resource-frequent-users-label">Frequent Users</div>
            <div className="resource-frequent-users-avatars">
              <OverlayTrigger
                key={DUMMY_EMAIL2}
                trigger={['hover', 'focus']}
                placement="top"
                overlay={
                  <Popover id="popover-trigger-hover-focus">
                    {DUMMY_EMAIL2}
                  </Popover>
                }
              >
                <Link
                  className="avatar-overlap"
                  onClick={logClick}
                  data-type="frequent-users"
                  to="/"
                  target={DUMMY_TARGET2}
                >
                  <Avatar
                    name={DUMMY_DISPLAY_NAME2}
                    round
                    size={25}
                    style={{ position: 'relative' }}
                  />
                </Link>
              </OverlayTrigger>
              <OverlayTrigger
                key={DUMMY_EMAIL1}
                trigger={['hover', 'focus']}
                placement="top"
                overlay={
                  <Popover id="popover-trigger-hover-focus">
                    {DUMMY_EMAIL1}
                  </Popover>
                }
              >
                <Link
                  className="avatar-overlap"
                  onClick={logClick}
                  data-type="frequent-users"
                  to="/"
                  target={DUMMY_TARGET1}
                >
                  <Avatar
                    name={DUMMY_DISPLAY_NAME1}
                    round
                    size={25}
                    style={{ position: 'relative' }}
                  />
                </Link>
              </OverlayTrigger>
            </div>
          </div>
          <div className="resource-tags">
            <div className="resource-tags-label">Tags</div>
            <div className="resource-tags-tags">{tagBody}</div>
          </div>
        </Link>
      </li>
    );
  }
}

export default TableListItem;
