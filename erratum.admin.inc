<?php

/**
* Menu callback for admin/config/content/erratum.
*/
function erratum_admin_settings() {
  $form = array();

  $form['erratum_settings'] = array(
    '#type' => 'fieldset',
    '#title' => t('Erratum settings'),
  );

  $form['erratum_settings']['erratum_mail'] = array(
    '#type' => 'textfield',
    '#title' => t('E-mail address'),
    '#default_value' => variable_get('erratum_mail', variable_get('site_mail', '')),
    '#description' => t('Email address for sending notifications about mistakes.'),
    '#required' => TRUE,
    '#element_validate' => array('erratum_element_validate_email'),
  );

  $form['erratum_settings']['erratum_popup_text'] = array(
    '#type' => 'textarea',
    '#title' => t('Popup text'),
    '#default_value' => variable_get('erratum_popup_text', ''),
    '#required' => TRUE,
  );

  $form['erratum_settings']['erratum_max_length'] = array(
    '#type' => 'textfield',
    '#title' => t('Maximum length'),
    '#default_value' => variable_get('erratum_max_length', ERRATUM_MAX_LENGTH),
    '#description' => t('The maximum length of the selected text in characters.'),
    '#element_validate' => array('element_validate_integer_positive'),
    '#required' => TRUE,
  );

  $form['erratum_settings']['erratum_mail_limit'] = array(
    '#type' => 'textfield',
    '#title' => t('Limit of reports'),
    '#default_value' => variable_get('erratum_mail_limit', ERRATUM_MAIL_LIMIT),
    '#description' => t('Limit of notifications from one IP. Set 0 if you do not want limit this one.'),
    '#element_validate' => array('element_validate_integer_positive'),
    '#required' => TRUE,
  );

  return system_settings_form($form);
}

/**
 * Page callback: Displays a listing of reports.
 */
function erratum_overview() {
  $header = array(
    'id' =>  array('data' => t('ID'), 'field' => 'e.id'),
    'entity_type' => array('data' => t('Entity Type'), 'field' => 'e.entity_type'),
    'entity_id' => array('data' => t('Entity ID'), 'field' => 'e.entity_id'),
    'fragment' => array('data' => t('Fragment'), 'field' => 'e.fragment'),
    'timestamp' => array('data' => t('Date'), 'field' => 'e.timestamp', 'sort' => 'desc'),
    'operations' => array('data' => t('Operations')),
  );

  $query = db_select('erratum', 'e')
      ->extend('PagerDefault')
      ->extend('TableSort');

  $result = $query
      ->fields('e', array('id', 'entity_type', 'entity_id', 'fragment', 'timestamp'))
      ->limit(50)
      ->orderByHeader($header)
      ->execute();

  $rows = array();

  foreach ($result as $item) {
    $url = _erratum_prepare_edit_url($item->entity_type, $item->entity_id);
    $rows[] = array('data' =>
        array(
          $item->id,
          $item->entity_type,
          $item->entity_id,
          $url ? l($item->fragment, $url) : $item->fragment,
          format_date($item->timestamp, 'short'),
          l(t('View'), 'admin/reports/erratum/' . $item->id),
        )
    );
  }

  $build['erratum_table'] = array(
    '#theme' => 'table',
    '#header' => $header,
    '#rows' => $rows,
    '#attributes' => array('id' => 'admin-erratum'),
    '#empty' => t('No erratum reports available.'),
  );
  $build['erratum_pager'] = array('#theme' => 'pager');

  return $build;
}

/**
 * Page callback: Displays details about a specific report.
 *
 * @param int $id
 * @return array|string
 */
function erratum_report($id) {
  $report = db_query('SELECT e.* FROM {erratum} e WHERE e.id = :id', array(':id' => $id))->fetchObject();
  if ($report) {
    $url = _erratum_prepare_edit_url($report->entity_type, $report->entity_id);
    $rows = array(
      array(
        array('data' => t('ID'), 'header' => TRUE),
        $report->id,
      ),
      array(
        array('data' => t('Entity ID'), 'header' => TRUE),
        $report->entity_id,
      ),
      array(
        array('data' => t('Entity Type'), 'header' => TRUE),
        $report->entity_type,
      ),
      array(
        array('data' => t('Field Name'), 'header' => TRUE),
        $report->field_name,
      ),
      array(
        array('data' => t('Fragment'), 'header' => TRUE),
          $url ? l($report->fragment, $url) : $report->fragment,
      ),
      array(
        array('data' => t('Location'), 'header' => TRUE),
        l($report->location, $report->location),
      ),
      array(
        array('data' => t('User'), 'header' => TRUE),
        $report->uid,
      ),
      array(
        array('data' => t('IP'), 'header' => TRUE),
        $report->ip,
      ),
      array(
        array('data' => t('Date'), 'header' => TRUE),
        format_date($report->timestamp, 'long'),
      ),
    );
    $build['erratum_table'] = array(
      '#theme' => 'table',
      '#rows' => $rows,
      '#attributes' => array('class' => array('erratum-report')),
    );

    return $build;
  }
  else {
    return drupal_not_found();
  }
}

/**
 * @param string $type
 * @param int $id
 * @return string
 */
function _erratum_prepare_edit_url($type, $id) {
  switch ($type) {
    case 'user':
      $url = 'user/' . $id . '/edit';
      break;
    case 'taxonomy_term':
      $url = 'taxonomy/term/' . $id . '/edit';
      break;
    case 'node':
      $url= 'node/' . $id . '/edit';
      break;
    default:
      $url = '';
      break;
  }

  return $url;
}