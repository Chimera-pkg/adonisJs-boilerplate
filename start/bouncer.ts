/**
 * Contract source: https://git.io/Jte3T
 *
 * Feel free to let us know via PR, if you find something broken in this config
 * file.
 */

import Bouncer from '@ioc:Adonis/Addons/Bouncer'

/*
|--------------------------------------------------------------------------
| Bouncer Actions
|--------------------------------------------------------------------------
|
| Actions allows you to separate your application business logic from the
| authorization logic. Feel free to make use of policies when you find
| yourself creating too many actions
|
| You can define an action using the `.define` method on the Bouncer object
| as shown in the following example
|
| ```
| 	Bouncer.define('deletePost', (user: User, post: Post) => {
|			return post.user_id === user.id
| 	})
| ```
|
|****************************************************************
| NOTE: Always export the "actions" const from this file
|****************************************************************
*/
export const { actions } = Bouncer

/*
|--------------------------------------------------------------------------
| Bouncer Policies
|--------------------------------------------------------------------------
|
| Policies are self contained actions for a given resource. For example: You
| can create a policy for a "User" resource, one policy for a "Post" resource
| and so on.
|
| The "registerPolicies" accepts a unique policy name and a function to lazy
| import the policy
|
| ```
| 	Bouncer.registerPolicies({
|			UserPolicy: () => import('App/Policies/User'),
| 		PostPolicy: () => import('App/Policies/Post')
| 	})
| ```
|
|****************************************************************
| NOTE: Always export the "policies" const from this file
|****************************************************************
*/
export const { policies } = Bouncer.registerPolicies({
  ManufacturerPolicy: () => import('App/Policies/ManufacturerPolicy'),
  ProductPolicy: () => import('App/Policies/ProductPolicy'),
  ProductQAPolicy: () => import('App/Policies/ProductQAPolicy'),
  ProductWorkflowPolicy: () => import('App/Policies/ProductWorkflowPolicy'),
  ProductSpecificationPolicy: () => import('App/Policies/ProductSpecificationPolicy'),
  ProductClinicalApplicationPolicy: () => import('App/Policies/ProductClinicalApplicationPolicy'),
  ProductUserManualPolicy: () => import('App/Policies/ProductUserManualPolicy'),
  HealthcarePolicy: () => import('App/Policies/HealthcarePolicy'),
  ProductComparisonPolicy: () => import('App/Policies/ProductComparisonPolicy'),
  ProductMediaPolicy: () => import('App/Policies/ProductMediaPolicy'),

  NewsPolicy: () => import('App/Policies/NewsPolicy'),
  GovAffairPolicy: () => import('App/Policies/GovAffairPolicy'),
  UserPolicy: () => import('App/Policies/UserPolicy'),
  RegulationServiceCategoryPolicy: () => import('App/Policies/RegulationServiceCategoryPolicy'),
  RegulationServicePolicy: () => import('App/Policies/RegulationServicePolicy'),
  MarketingServiceCategoryPolicy: () => import('App/Policies/MarketingServiceCategoryPolicy'),
  MarketingServicePolicy: () => import('App/Policies/MarketingServicePolicy'),

  IndustryCategoryPolicy: () => import('App/Policies/IndustryCategoryPolicy'),
  ProductCategoryPolicy: () => import('App/Policies/ProductCategoryPolicy'),
  RegulationAssessmentPolicy: () => import('App/Policies/RegulationAssessmentPolicy'),

  ServiceCategoryPolicy: () => import('App/Policies/ServiceCategoryPolicy'),
  ServicePolicy: () => import('App/Policies/ServicePolicy'),
  ServiceMediaPolicy: () => import('App/Policies/ServiceMediaPolicy'),
  ServiceUserManualPolicy: () => import('App/Policies/ServiceUserManualPolicy'),
  ServiceQAPolicy: () => import('App/Policies/ServiceQAPolicy'),
  ServiceClinicalApplicationPolicy: () => import('App/Policies/ServiceClinicalApplicationPolicy'),
  ServiceWorkflowPolicy: () => import('App/Policies/ServiceWorkflowPolicy'),
  ServiceSpecificationPolicy: () => import('App/Policies/ServiceSpecificationPolicy'),
  ServiceComparisonPolicy: () => import('App/Policies/ServiceComparisonPolicy'),
})
